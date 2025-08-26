## Code Style

- Prefer short one-word variable names. Avoid abbreviations: use `current` instead of `cur`.
- Do not add any comments to generated code by default.
- Import only specific functions. Don’t import everything.
- Don’t use `export default`.
- Always use `.ts` in TS files imports.
- Use discriminant union in types: `{ missing: true } | { missing: false, content: string }` instead of `{ missing: boolean, content?: string }`.

## Architecture

- Avoid adding dependencies.
- Always use TypeScript with branded types.

## LLMS

- Never change `eslint.config.ts`. Always change code to fix found issues.
- Never use `as any`.
- Always merge type and regular import.

## Testing

- Always run `./scripts/format.sh` and `pnpm test`.
- Run specific test by `pnpm bnt path/to/test.test.ts -t 'test name'`
