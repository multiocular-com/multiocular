#!/usr/bin/bash

files=$(git ls-files --modified --deleted --others --exclude-standard \
  -- '*.ts' '*.js' '*.cts' '*.mts' '*.cjs' '*.mjs' '*.svelte')
if [[ -n "$files" ]]; then
  echo "$files" | xargs pnpm eslint --cache --concurrency auto --fix
  echo "$files" | xargs pnpm prettier --experimental-cli --write
fi
