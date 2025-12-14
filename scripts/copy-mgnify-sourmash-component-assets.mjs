// scripts/copy-mgnify-sourmash-assets.mjs
import { mkdirSync, copyFileSync } from 'fs';
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
  resolve(srcDir, 'sketcher.worker.js'),
  resolve(publicDir, 'sketcher.worker.js')
);

console.log(`[copy] mgnify-sourmash assets → ${publicDir}`);
