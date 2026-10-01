const assert = require('node:assert/strict');
const test = require('node:test');

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS' },
});

const normaliseSourmashSignature = require(
  '../src/utils/normaliseSourmashSignature.ts'
).default;

test('preserves Sourmash max_hash exactly when wrapping a signature', () => {
  const signature =
    '{"class":"sourmash_signature","signatures":[{"max_hash":18446744073709552}]}';

  assert.equal(normaliseSourmashSignature(signature), `[${signature}]`);
});

test('preserves an existing signature array exactly', () => {
  const signature =
    '[{"class":"sourmash_signature","signatures":[{"max_hash":18446744073709552}]}]';

  assert.equal(normaliseSourmashSignature(signature), signature);
});

test('leaves invalid JSON unchanged', () => {
  const signature = 'not-json';

  assert.equal(normaliseSourmashSignature(signature), signature);
});
