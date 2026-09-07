#!/usr/bin/env node
/**
 * Vercel Environment Variable Setter — idempotent wrapper for `vercel env add`.
 *
 * Reads from .env.production.local and sets production env vars on Vercel.
 * Only sets vars that are defined in the file and not already set to the same value.
 *
 * Usage:
 *   node scripts/vercel-env-set.mjs              # live run
 *   node scripts/vercel-env-set.mjs --dry-run    # preview only
 */

import { execa } from 'execa';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = argv.includes('--dry-run');

const TARGET_VARS = ['VITE_SITE_URL', 'VITE_PLAUSIBLE_SRC', 'VITE_PLAUSIBLE_DOMAIN'];

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

async function getCurrentVercelEnv(varName) {
  try {
    const { stdout } = await execa('vercel', ['env', 'ls', '--json'], { reject: false });
    const envs = JSON.parse(stdout);
    const entry = envs.find((e) => e.key === varName && e.target.includes('production'));
    return entry?.value ?? null;
  } catch {
    return null;
  }
}

async function setVercelEnv(varName, value) {
  if (DRY_RUN) {
    console.log(`  $ vercel env add ${varName} production <<< "${value}"`);
    return true;
  }
  try {
    // Use stdin to pass the value securely
    await execa('vercel', ['env', 'add', varName, 'production'], {
      input: value,
      reject: true,
    });
    return true;
  } catch (err) {
    // If already exists with same value, vercel exits 0 but we may get stderr
    if (err.stderr?.includes('already exists')) {
      console.log(`  ${varName} already set (same value)`);
      return true;
    }
    throw err;
  }
}

async function main() {
  const envPath = resolve(ROOT, '.env.production.local');
  if (!existsSync(envPath)) {
    console.error('[ERROR] .env.production.local not found');
    process.exit(1);
  }

  const env = parseEnvFile(envPath);
  const toSet = {};

  for (const varName of TARGET_VARS) {
    if (env[varName]) {
      const current = await getCurrentVercelEnv(varName);
      if (current === env[varName]) {
        console.log(`⊘ ${varName} already set to same value — skipping`);
      } else {
        toSet[varName] = env[varName];
        console.log(`→ ${varName} will be set${current ? ' (updating)' : ''}`);
      }
    } else {
      console.log(`⊘ ${varName} not in .env.production.local — skipping`);
    }
  }

  if (Object.keys(toSet).length === 0) {
    console.log('\nNo environment variables to set.');
    return;
  }

  console.log('');
  for (const [varName, value] of Object.entries(toSet)) {
    try {
      await setVercelEnv(varName, value);
      console.log(`✓ ${varName} set successfully`);
    } catch (err) {
      console.error(`✗ Failed to set ${varName}:`, err.stderr ?? err.message);
      process.exit(1);
    }
  }

  console.log('\nAll environment variables set. Trigger a new deploy to pick them up.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
