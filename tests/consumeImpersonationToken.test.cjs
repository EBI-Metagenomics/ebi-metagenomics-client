const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS' },
});
const consumeToken = require('../src/utils/consumeImpersonationToken').default;
const token = (claims) =>
  `e30.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;

function setup(hash) {
  const storage = new Map([
    ['mgnify.v2.username', 'Webin-old'],
    ['mgnify.v2.token', 'old-token'],
    ['mgnify.sessionExpired', 'true'],
  ]);
  global.localStorage = {
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  let replacement;
  global.window = {
    location: {
      hash,
      pathname: '/metagenomics/studies/MGYS1',
      search: '?tab=data',
    },
    history: {
      state: { existing: true },
      replaceState: (state, title, url) => {
        replacement = { state, url };
      },
    },
  };
  return { storage, replacement: () => replacement };
}

test('imports the account before application startup and removes the token URL', () => {
  const jwt = token({
    username: 'Webin-12345',
    exp: Date.now() / 1000 + 600,
    token_type: 'sliding',
  });
  const state = setup(`#impersonation_token=${jwt}`);
  consumeToken();
  assert.equal(state.storage.get('mgnify.v2.token'), jwt);
  assert.equal(state.storage.get('mgnify.v2.username'), 'Webin-12345');
  assert.equal(state.storage.has('mgnify.sessionExpired'), false);
  assert.deepEqual(state.replacement(), {
    state: { existing: true },
    url: '/metagenomics/studies/MGYS1?tab=data',
  });
});

test('preserves ordinary tab fragments', () => {
  const state = setup('#analyses');
  consumeToken();
  assert.equal(state.replacement(), undefined);
  assert.equal(state.storage.get('mgnify.v2.token'), 'old-token');
});

test('removes invalid token fragments without changing the current account', () => {
  for (const jwt of [
    '',
    'invalid',
    token({ username: 'Webin-1', exp: 1, token_type: 'sliding' }),
    token({
      username: 'Webin-1',
      exp: Date.now() / 1000 + 600,
      token_type: 'access',
    }),
    token({ exp: Date.now() / 1000 + 600, token_type: 'sliding' }),
  ]) {
    const state = setup(`#impersonation_token=${jwt}`);
    consumeToken();
    assert.ok(state.replacement());
    assert.equal(state.storage.get('mgnify.v2.token'), 'old-token');
    assert.equal(state.storage.get('mgnify.v2.username'), 'Webin-old');
  }
});
