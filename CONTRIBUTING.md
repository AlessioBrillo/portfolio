# Contributing

This is a personal portfolio, but it follows real engineering hygiene — both as a
discipline and because the repository is part of the showcase.

## Workflow

1. Branch from `main` (`feat/...`, `fix/...`, `docs/...`, `chore/...`).
2. Make focused changes; keep files small and cohesive.
3. Ensure the local gates pass (Husky runs typecheck + lint-staged on commit):

   ```bash
   npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
   ```

4. Open a PR using the template; link any relevant ADR.

## Commit messages

Conventional Commits, enforced by commitlint:

```
<type>: <description>

[optional body]
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

## Architecture decisions

Non-obvious choices are recorded as ADRs in [`docs/adr/`](docs/adr/). ADRs are
immutable once accepted — a change of mind produces a new ADR that supersedes the
old one. If your change alters an accepted decision, add a new ADR rather than
editing the old one.

## Language

The entire project — code, comments, documentation, and commits — is in English.

## Do not commit

- The private design paper or any `*.paper.md` file (git-ignored).
- Secrets, `.env` files, or private content.
- Font binaries until they are properly licensed and subset.
