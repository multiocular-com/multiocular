# ꙮ Multiocular

A tool to review dependencies changes to prevent supply chain attack.

```diff
$ npm update
$ npx multiocular --text

--- npm:better-node-test@0.7.1/bin.js
+++ npm:better-node-test@0.7.2/bin.js
@@ -76,7 +84,7 @@
   }
   if (loader) {
     base.push('--enable-source-maps', '--import', loader)
-  } else if (checkNodeVersion(22.6)) {
+  } else if (checkNodeVersion(22, 6)) {
     base.push(
       '--experimental-strip-types',
       '--disable-warning=ExperimentalWarning'

```

# Install

```sh
npm install multiocular
```

```sh
pnpm install multiocular
```
