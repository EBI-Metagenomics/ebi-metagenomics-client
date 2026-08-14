# Agent instructions

## Playwright MCP

- This repository has a configured Playwright MCP. Search the available and
  deferred tools for `mcp__playwright__*` before assuming browser automation is
  unavailable. It is independent of the Browser plugin.
- Prefer snapshots or element lookup for locating controls and screenshots for
  visual inspection. Use browser evaluation to inspect computed styles and
  element bounds when needed.
- Reload after source changes; temporary DOM edits are not verification.
- Reuse an existing dev server when appropriate. Otherwise run `npm run start`
  and use the port printed by Vite. Do not stop a server owned by the user.
- Remove only Playwright artifacts created by the current agent.

## Cypress

- Cypress expects the app at `http://localhost:9000`; both
  `cypress.config.cjs` and `cypress/util/config.js` contain this port. Confirm
  Vite is using 9000 before testing.
- If the user already has the current app running on port 9000, reuse it. Do not
  start another dev server or run `npm test`, and do not stop the user's server.
- Run focused tests with `npx cypress run --spec <specs>`. Start
  `npm run serve:fixtures` separately if those tests need fixtures.
- With no existing server, use `npm test` for the full suite. For focused tests,
  run `npm run start` and `npm run serve:fixtures` as separate processes before
  invoking Cypress.
- Stop only processes started by the current agent.
