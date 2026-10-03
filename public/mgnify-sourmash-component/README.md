# Vendored MGnify Sourmash component

These runtime assets are temporarily vendored because the corresponding npm
release was published without an up-to-date build.

- Source repository: `EBI-Metagenomics/mgnify-sourmash-component`
- Source base commit: `09bdaeef76923924bf344dcf4eb2d4ed503a51a6`
- Source working-tree change: public option renamed from `accept-sigs` to
  `accept_sigs`
- Built with: `npm run build`
- Vendored on: 2026-10-03

The web client loads `mgnify-sourmash-component.js` directly from this
directory. Once a corrected npm release is available, restore the npm
dependency and post-install copy step, then remove these vendored files.
