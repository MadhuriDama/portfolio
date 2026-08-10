/**
 * Copies just the public site into dist/ for deployment.
 *
 * Everything else in the repo — the design brief, .claude/, the dev server,
 * package.json, the source resume PDF — stays out of the published folder.
 *
 *   npm run build
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Everything the deployed site actually needs.
const INCLUDE = ['index.html', 'assets'];

function rimraf(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

let fileCount = 0;
let byteCount = 0;

function copy(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copy(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  fileCount++;
  byteCount += stat.size;
  console.log('  + ' + path.relative(ROOT, dest).replace(/\\/g, '/'));
}

rimraf(DIST);
fs.mkdirSync(DIST, { recursive: true });

for (const entry of INCLUDE) {
  const src = path.join(ROOT, entry);
  if (!fs.existsSync(src)) {
    console.error('Missing required file or folder: ' + entry);
    process.exit(1);
  }
  copy(src, path.join(DIST, entry));
}

// SPA-less static host niceties: 404 falls back to the single page.
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(DIST, '404.html'));
fileCount++;

// Tells GitHub Pages not to run the files through Jekyll.
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
fileCount++;

console.log('');
console.log('  Built dist/ — ' + fileCount + ' files, ' + Math.round(byteCount / 1024) + ' KB');
console.log('  Upload the CONTENTS of dist/ to your host.');
console.log('');
