# Agent instructions

## Playwright MCP for local visual QA

- This repository has a configured Playwright MCP. Before concluding that browser
  access is unavailable, search the available and deferred tools for
  `mcp__playwright__*`.
- The Playwright MCP is separate from the Browser plugin. It does not require the
  ChatGPT Chrome extension, an in-app Browser session, or the user's default
  browser. The Browser plugin returning an empty browser list does not mean that
  Playwright is unavailable.
- Prefer `browser_snapshot` or `browser_find` to locate interactive elements.
  Use `browser_take_screenshot` for visual inspection, not as the basis for
  locating clicks.
- Useful tools for UI work are `browser_navigate`, `browser_click`,
  `browser_type`, `browser_hover`, `browser_take_screenshot`, and
  `browser_evaluate`. Use `browser_evaluate` to inspect computed styles and
  bounding boxes when layout behavior is unclear.
- Test source changes after a fresh navigation or reload. Do not treat a
  temporary DOM or style change made with `browser_evaluate` as verification of
  the source implementation.
- Playwright screenshots and snapshots may create `.playwright-mcp/` and image
  files in the repository. Move or remove only the artifacts created by the
  current agent after finishing visual QA.

### Running the app for Playwright

- Reuse a current dev server when one is already running. Otherwise run
  `npm run start` and use the exact URL printed by Vite.
- Vite prefers port 9000 but automatically falls back to 9001 when 9000 is in
  use. Playwright can use either port as long as `browser_navigate` uses the
  actual port.
- Binding a local port may require sandbox escalation. Request it rather than
  working around the sandbox.
- External MGnify API requests may be blocked in the Playwright environment. An
  `ERR_NETWORK` page does not indicate a component failure. Use repository
  fixtures where possible.

For the fixture-backed contig-search UI used by the tests:

1. Start `npm run serve:fixtures`; it serves `cypress/fixtures` on port 5055.
2. Use the analysis fixture
   `cypress/fixtures/apiv2/analyses/analysisMGYA00000002.json` for the request
   matching `**/metagenomics/api/v2/analyses/MGYA00000002`.
3. When interception is required, use `browser_run_code_unsafe` only for the
   narrowly scoped `page.route(...)` fixture fulfilment. Resolve the fixture to
   an absolute path under the current repository; do not hard-code a user's
   home directory in source or documentation.
4. Navigate to
   `/metagenomics/analyses/MGYA00000002/contigs-viewer/search-contigs` on the
   active Vite port.
5. Click **View & search contigs** if the GFF has not already been indexed, then
   wait for **Search all**.
6. Inspect the component in each relevant state, including hover, and prefer an
   element screenshot over a full-page screenshot.

The genome page uses a hash route such as
`/metagenomics/genomes/MGYG000000001#genome-browser`; it does not use the
analysis `contigs-viewer/search-contigs` suffix.

## Cypress

Cypress expects the application at port 9000 in two places:

- `cypress.config.cjs` sets `baseUrl` to `http://localhost:9000`.
- `cypress/util/config.js` constructs absolute test URLs under
  `http://localhost:9000/metagenomics/`.

Consequently, do not let the test app silently fall back to port 9001. Merely
overriding Cypress's `baseUrl` is insufficient because the helper URLs remain
hard-coded to port 9000.

### When the user already has a dev server on port 9000

- Reuse it if it is serving this checkout and reflects the current source.
- Do not run `npm test` or start another Vite server: the second server will fall
  back to 9001 while Cypress continues testing the server on 9000.
- Do not stop or restart a server owned by the user. If it is stale or its
  ownership is unclear, ask before replacing it.
- Start `npm run serve:fixtures` only if port 5055 is not already serving the
  fixtures required by the selected specs.
- Run focused tests directly, for example:

  ```sh
  npx cypress run --spec cypress/e2e/contig_viewer.js,cypress/e2e/compressed_tsv_table.js
  ```

### When no dev server is running

- For the complete suite, `npm test` starts Vite, Cypress, and the fixture server
  together.
- For focused tests, start these as separate long-running processes:

  ```sh
  npm run start
  npm run serve:fixtures
  ```

  Confirm that Vite reports port 9000, then run the desired `npx cypress run --spec ...` command in another process.

- If Vite reports port 9001, something else owns port 9000. Do not proceed under
  the assumption that Cypress will test 9001. Reuse the existing 9000 server if
  appropriate, or ask before stopping it.
- Stop only the server processes started by the current agent when testing is
  complete.

For the wildcard-search work, the focused contig and compressed-TSV command
above exercises five tests across both implementations.
