import { mkdirSync, copyFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

// Final public target
const publicDir = resolve(process.cwd(), 'public', 'mgnify-sourmash-component');

mkdirSync(publicDir, { recursive: true });

const srcDir = resolve(
  process.cwd(),
  'node_modules/mgnify-sourmash-component/dist'
);

copyFileSync(
  resolve(srcDir, 'mgnify-sourmash-component.js'),
  resolve(publicDir, 'mgnify-sourmash-component.js')
);

copyFileSync(
  resolve(srcDir, 'mgnify-sourmash-component.worker.js'),
  resolve(publicDir, 'mgnify-sourmash-component.worker.js')
);

copyFileSync(
  resolve(
    srcDir,
    'node_modules_sourmash_sourmash_js.mgnify-sourmash-component.worker.js'
  ),
  resolve(
    publicDir,
    'node_modules_sourmash_sourmash_js.mgnify-sourmash-component.worker.js'
  )
);

// Copy all .wasm files from the sourmash component output
for (const fileName of readdirSync(srcDir)) {
  if (fileName.endsWith('.wasm')) {
    copyFileSync(resolve(srcDir, fileName), resolve(publicDir, fileName));
  }
}

console.log(`[copy] mgnify-sourmash assets → ${publicDir}`);
