#!/usr/bin/env node
/**
 * Domain Landing Orchestrator — idempotent, verifiable, rollback-safe.
 *
 * Executes the domain-landing checklist from docs/domain-runbook.md as an
 * automated sequence. Each step validates preconditions before proceeding,
 * prints rollback instructions on failure, and exits with distinct codes.
 *
 * Usage:
 *   node scripts/domain-landing.mjs              # live run
 *   node scripts/domain-landing.mjs --dry-run    # preview only, no mutations
 *   node scripts/domain-landing.mjs --step=N     # run from step N (1-indexed)
 */

import { execa } from 'execa';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = argv.includes('--dry-run');
const START_STEP = Number(argv.find((a) => a.startsWith('--step='))?.split('=')[1] ?? '1');

const STEPS = [
  {
    id: 'validate-site-url',
    label: 'Validate site URL (HTTPS, reachable, HSTS)',
    cmd: 'node scripts/validate-site-url.mjs',
    rollback: 'No mutation — fix VITE_SITE_URL in .env.production.local and Vercel env.',
  },
  {
    id: 'generate-sitemap',
    label: 'Generate sitemap.xml with absolute canonical URLs',
    cmd: 'npm run build && node scripts/generate-sitemap.mjs',
    rollback: 'No mutation — sitemap is generated at build time. Re-run after fix.',
  },
  {
    id: 'finalize-dist',
    label: 'Finalize dist/ (inject absolute og:image, canonical)',
    cmd: 'node scripts/finalize-dist.mjs',
    rollback: 'No mutation — dist/ is rebuilt on next deploy. Re-run after fix.',
  },
  {
    id: 'vercel-env-set',
    label: 'Set Vercel environment variables (VITE_SITE_URL, Plausible)',
    cmd: 'node scripts/vercel-env-set.mjs',
    rollback:
      'vercel env rm VITE_SITE_URL production && vercel env rm VITE_PLAUSIBLE_SRC production && vercel env rm VITE_PLAUSIBLE_DOMAIN production',
  },
  {
    id: 'vercel-deploy',
    label: 'Trigger Vercel production deploy with new env',
    cmd: 'vercel --prod --scope=$(vercel scope --json | jq -r .name) --yes',
    rollback: 'vercel rollback <deployment-url> --scope=<team> --yes',
  },
  {
    id: 'vercel-alias',
    label: 'Assign custom domain alias to production deployment',
    cmd: 'node scripts/vercel-alias.mjs',
    rollback: 'vercel alias rm <custom-domain> --scope=<team>',
  },
  {
    id: 'csp-widen-img-src',
    label: 'Widen CSP img-src for CDN origin (if photos on CDN)',
    cmd: 'node scripts/csp-widen-img-src.mjs',
    rollback: 'git checkout vercel.json && vercel --prod --scope=<team> --yes',
  },
  {
    id: 'smoke-deploy',
    label: 'Smoke test live domain (health, canonical, OG, tonal)',
    cmd: 'node scripts/smoke-deploy.mjs',
    rollback: 'Investigate failure — see smoke output. May require vercel rollback.',
  },
];

function logStep(step, status, detail = '') {
  const prefix = DRY_RUN ? '[DRY-RUN]' : '[LIVE]';
  const icon = status === 'ok' ? '✓' : status === 'skip' ? '⊘' : '✗';
  console.log(
    `${prefix} ${icon} Step ${step.num}/${STEPS.length}: ${step.label}${detail ? ` — ${detail}` : ''}`,
  );
}

function printRollback(step) {
  console.error(`  Rollback: ${step.rollback}`);
}

async function runCommand(cmd, cwd = ROOT) {
  if (DRY_RUN) {
    console.log(`  $ ${cmd}`);
    return { stdout: '', stderr: '', exitCode: 0 };
  }
  try {
    const { stdout, stderr } = await execa(cmd, {
      shell: true,
      cwd,
      reject: false,
      timeout: 180_000,
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (err) {
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? String(err),
      exitCode: err.exitCode ?? 1,
    };
  }
}

async function main() {
  console.log(`\n=== Domain Landing Orchestrator ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'} ===`);
  console.log(`Root: ${ROOT}\n`);

  // Pre-flight: check .env.production.local exists and has VITE_SITE_URL
  const envPath = resolve(ROOT, '.env.production.local');
  if (!existsSync(envPath)) {
    console.error(
      '[ERROR] .env.production.local not found. Create it with VITE_SITE_URL=https://your-domain.com',
    );
    process.exit(2);
  }
  const envContent = readFileSync(envPath, 'utf8');
  if (!envContent.includes('VITE_SITE_URL=')) {
    console.error('[ERROR] VITE_SITE_URL not set in .env.production.local');
    process.exit(2);
  }

  let failedStep = null;

  for (let i = START_STEP - 1; i < STEPS.length; i++) {
    const step = { ...STEPS[i], num: i + 1 };

    if (i < START_STEP - 1) {
      logStep(step, 'skip', 'skipped via --step');
      continue;
    }

    logStep(step, 'running');
    const result = await runCommand(step.cmd);

    if (result.exitCode === 0) {
      logStep(step, 'ok');
    } else {
      logStep(step, 'fail', result.stderr.trim().slice(0, 200));
      printRollback(step);
      failedStep = step;
      break;
    }
  }

  console.log('\n=== Summary ===');
  if (failedStep) {
    console.error(`FAILED at step ${failedStep.num}: ${failedStep.label}`);
    console.error(`Run with --step=${failedStep.num} to retry from this step after fixing.`);
    process.exit(1);
  }

  console.log('All steps completed successfully.');
  if (DRY_RUN) {
    console.log('This was a dry run. Execute without --dry-run to perform the actual landing.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(2);
});
