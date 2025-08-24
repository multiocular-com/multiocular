## Code Style

- Prefer short one-word variable names. Avoid abbreviations: use `current` instead of `cur`.
- Do not add any comments to generated code by default.
- Import only specific functions. Don’t import everything.
- Don’t use `export default`.
- Always use `.ts` in TS files imports.

## Architecture

- Avoid adding dependencies.
- Always use TypeScript with branded types.

## LLMS

- Never change `eslint.config.ts`. Always change code to fix found issues.
- Never use `as any`.

## Testing

- Always run `./scripts/format.sh` and `pnpm test`.
