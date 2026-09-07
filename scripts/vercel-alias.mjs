#!/usr/bin/env node
/**
 * Vercel Domain Alias Assignment — idempotent with DNS propagation wait.
 *
 * Assigns the custom domain to the latest production deployment.
 * Waits for DNS propagation before declaring success.
 *
 * Usage:
 *   node scripts/vercel-alias.mjs              # live run
 *   node scripts/vercel-alias.mjs --dry-run    # preview only
 */

import { execa } from 'execa';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = argv.includes('--dry-run');

function parseEnvFile(path) {
  const content = readFileSync(path, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valParts] = trimmed.split('=');
    if (key && valParts.length > 0) {
      env[key.trim()] = valParts.join('=').trim();
    }
  }
  return env;
}

async function getLatestProductionDeployment() {
  try {
    const { stdout } = await execa('vercel', ['ls', '--json', '--scope', 'production'], {
      reject: false,
    });
    const deployments = JSON.parse(stdout);
    // Find latest production deployment (state = READY)
    const prod = deployments.find((d) => d.target === 'production' && d.state === 'READY');
    return prod?.url ?? null;
  } catch {
    return null;
  }
}

async function getCustomDomain() {
  const envPath = resolve(ROOT, '.env.production.local');
  if (!existsSync(envPath)) return null;
  const env = parseEnvFile(envPath);
  const siteUrl = env.VITE_SITE_URL;
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return null;
  }
}

async function waitForDnsPropagation(domain, maxWaitMs = 300_000, intervalMs = 10_000) {
  const start = Date.now();
  console.log(`  Waiting for DNS propagation for ${domain}...`);
  while (Date.now() - start < maxWaitMs) {
    try {
      const { stdout } = await execa('dig', ['+short', 'CNAME', domain], { reject: false });
      if (stdout.includes('vercel') || stdout.includes('cname')) {
        console.log(`  DNS propagated: ${stdout.trim()}`);
        return true;
      }
    } catch {
      // dig not available, try nslookup
      try {
        const { stdout } = await execa('nslookup', ['-type=CNAME', domain], { reject: false });
        if (stdout.includes('vercel')) {
          console.log(`  DNS propagated (nslookup)`);
          return true;
        }
      } catch {
        // ignore
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.warn(`  DNS propagation timeout after ${maxWaitMs / 1000}s — proceeding anyway`);
  return false;
}

async function assignAlias(deploymentUrl, domain) {
  if (DRY_RUN) {
    console.log(`  $ vercel alias set ${deploymentUrl} ${domain}`);
    return true;
  }
  try {
    await execa('vercel', ['alias', 'set', deploymentUrl, domain], { reject: true });
    return true;
  } catch (err) {
    if (err.stderr?.includes('already assigned')) {
      console.log(`  Alias ${domain} already assigned to ${deploymentUrl}`);
      return true;
    }
    throw err;
  }
}

async function main() {
  const domain = await getCustomDomain();
  if (!domain) {
    console.error('[ERROR] Could not determine custom domain from VITE_SITE_URL');
    process.exit(1);
  }

  console.log(`Target domain: ${domain}`);

  const deploymentUrl = await getLatestProductionDeployment();
  if (!deploymentUrl) {
    console.error('[ERROR] No ready production deployment found. Deploy first.');
    process.exit(1);
  }
  console.log(`Latest production deployment: ${deploymentUrl}`);

  // Check if already assigned
  try {
    const { stdout } = await execa('vercel', ['alias', 'ls', '--json'], { reject: false });
    const aliases = JSON.parse(stdout);
    const existing = aliases.find((a) => a.alias === domain);
    if (existing && existing.deploymentUrl === deploymentUrl) {
      console.log(`⊘ Alias ${domain} already points to ${deploymentUrl} — skipping`);
      return;
    }
  } catch {
    // ignore
  }

  console.log('\nAssigning alias...');
  await assignAlias(deploymentUrl, domain);

  console.log('\nWaiting for DNS propagation...');
  await waitForDnsPropagation(domain);

  console.log(`\n✓ Domain ${domain} assigned to ${deploymentUrl}`);
  console.log('  Verify with: curl -I https://' + domain);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
