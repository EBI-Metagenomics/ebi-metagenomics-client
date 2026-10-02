const assert = require('node:assert/strict');
const test = require('node:test');

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS' },
});

const {
  default: normaliseSourmashSignature,
  normaliseBranchwaterSignature,
  normaliseSourmashGatherSignature,
  normaliseSourmashSignatureEnvelope,
} = require('../src/utils/normaliseSourmashSignature');
const validateBranchwaterSignature =
  require('../src/utils/validateBranchwaterSignature').default;

const sketch = {
  class: 'sourmash_signature',
  hash_function: '0.murmur64',
  signatures: [
    {
      ksize: 21,
      max_hash: 18446744073709552,
      mins: [12345],
      molecule: 'DNA',
      num: 0,
      seed: 42,
    },
  ],
};

test('accepts the Branchwater signature format as an object or array', () => {
  assert.deepEqual(validateBranchwaterSignature(JSON.stringify(sketch)), {
    valid: true,
  });
  assert.deepEqual(validateBranchwaterSignature(JSON.stringify([sketch])), {
    valid: true,
  });
});

test('rejects sketches with incompatible Branchwater parameters', () => {
  const incompatibleSketches = [
    { ...sketch.signatures[0], ksize: 31 },
    { ...sketch.signatures[0], max_hash: 1844674407370955 },
    { ...sketch.signatures[0], molecule: 'protein' },
    { ...sketch.signatures[0], seed: 41 },
  ];

  incompatibleSketches.forEach((candidate) => {
    const result = validateBranchwaterSignature(
      JSON.stringify({ ...sketch, signatures: [candidate] })
    );
    assert.equal(result.valid, false);
  });
});

test('explains which Branchwater setting is incompatible', () => {
  const wrongKsize = validateBranchwaterSignature(
    JSON.stringify({
      ...sketch,
      signatures: [{ ...sketch.signatures[0], ksize: 31 }],
    })
  );
  assert.equal(wrongKsize.valid, false);
  assert.match(wrongKsize.error, /k-mer size 31 instead of 21/);
  assert.match(wrongKsize.error, /Required settings: DNA/);

  const wrongScaled = validateBranchwaterSignature(
    JSON.stringify({
      ...sketch,
      signatures: [{ ...sketch.signatures[0], scaled: 2000 }],
    })
  );
  assert.equal(wrongScaled.valid, false);
  assert.match(wrongScaled.error, /scaled value 2000 instead of 1000/);

  const wrongHashFunction = validateBranchwaterSignature(
    JSON.stringify({ ...sketch, hash_function: 'unsupported' })
  );
  assert.equal(wrongHashFunction.valid, false);
  assert.match(
    wrongHashFunction.error,
    /hash function unsupported instead of 0\.murmur64/
  );
});

test('accepts multiple sketches when one is Branchwater-compatible', () => {
  const result = validateBranchwaterSignature(
    JSON.stringify({
      ...sketch,
      signatures: [
        { ...sketch.signatures[0], ksize: 31 },
        sketch.signatures[0],
        { ...sketch.signatures[0], ksize: 51 },
      ],
    })
  );
  assert.equal(result.valid, true);
});

test('rejects malformed, empty, and wholly incompatible signatures', () => {
  assert.equal(validateBranchwaterSignature('not JSON').valid, false);
  assert.equal(
    validateBranchwaterSignature(
      JSON.stringify({
        ...sketch,
        signatures: [{ ...sketch.signatures[0], mins: [] }],
      })
    ).valid,
    false
  );
  assert.equal(
    validateBranchwaterSignature(
      JSON.stringify({
        ...sketch,
        signatures: [
          { ...sketch.signatures[0], ksize: 31 },
          { ...sketch.signatures[0], ksize: 51 },
        ],
      })
    ).valid,
    false
  );
});

test('normalises Branchwater to an object without changing large integers', () => {
  const rawObject = '{"class":"sourmash_signature","mins":[18446744073709551]}';
  const rawArray = `[${rawObject}]`;

  assert.equal(normaliseBranchwaterSignature(rawObject), rawObject);
  assert.equal(normaliseBranchwaterSignature(`  ${rawArray}\n`), rawObject);
  assert.equal(
    normaliseBranchwaterSignature(`[${rawObject},${rawObject}]`),
    `[${rawObject},${rawObject}]`
  );
  assert.equal(normaliseBranchwaterSignature('not JSON'), 'not JSON');
});

test('preserves large hash text for Sourmash gather', () => {
  const rawObject = '{"class":"sourmash_signature","mins":[18446744073709551]}';
  const rawArray = `[${rawObject}]`;

  assert.equal(normaliseSourmashGatherSignature(rawObject), rawArray);
  assert.equal(normaliseSourmashGatherSignature(`  ${rawArray}\n`), rawArray);
  assert.equal(normaliseSourmashGatherSignature('not JSON'), 'not JSON');
});

test('selects normalisation by search target', () => {
  const signature = '{"class":"sourmash_signature","mins":[18446744073709551]}';

  assert.equal(
    normaliseSourmashSignature(signature, 'branchwater'),
    normaliseBranchwaterSignature(signature)
  );
  assert.equal(
    normaliseSourmashSignature(signature, 'sourmash'),
    normaliseSourmashGatherSignature(signature)
  );
  assert.throws(
    () => normaliseSourmashSignature(signature, 'unsupported'),
    /Unsupported signature normalisation target/
  );
});

test('both search-specific wrappers use the shared envelope normaliser', () => {
  const rawObject = '{"class":"sourmash_signature","mins":[18446744073709551]}';

  assert.equal(
    normaliseBranchwaterSignature(rawObject),
    normaliseSourmashSignatureEnvelope(rawObject, 'object')
  );
  assert.equal(
    normaliseSourmashGatherSignature(rawObject),
    normaliseSourmashSignatureEnvelope(rawObject, 'array')
  );
  assert.throws(
    () => normaliseSourmashSignatureEnvelope(rawObject, 'unsupported'),
    /Unsupported signature envelope/
  );
});
