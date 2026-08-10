/**
 * Static file server for the portfolio.
 *
 * Uses only Node built-ins, so `npm start` works without `npm install`.
 *
 *   npm start                 -> http://localhost:5173
 *   npm run dev               -> same, and opens the browser
 *   npm run preview           -> serves the built dist/ folder
 *   node scripts/serve.js --port 8080
 *   node scripts/serve.js --root dist
 *   $env:PORT=8080; npm start (PowerShell)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = process.argv.slice(2);

const rootFlag = args.indexOf('--root');
const ROOT = path.resolve(
  __dirname,
  '..',
  (rootFlag !== -1 && args[rootFlag + 1]) || '.'
);

const portFlag = args.indexOf('--port');
const START_PORT = Number(
  (portFlag !== -1 && args[portFlag + 1]) || process.env.PORT || 5173
);
const OPEN = args.includes('--open');
const MAX_PORT_TRIES = 10;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, headers) {
  res.writeHead(status, headers || { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(body);
}

if (!fs.existsSync(ROOT)) {
  console.error('Root folder does not exist: ' + ROOT);
  console.error('If you meant to preview the build, run `npm run build` first.');
  process.exit(1);
}

const server = http.createServer(function (req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    return;
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    send(res, 400, 'Bad request');
    return;
  }
  if (urlPath === '/') { urlPath = '/index.html'; }

  const filePath = path.join(ROOT, path.normalize(urlPath));

  // never serve anything outside the project directory
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      console.log('404 ' + urlPath);
      send(res, 404, 'Not found');
      return;
    }

    const headers = {
      'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      // always revalidate so edits show up on refresh
      'Cache-Control': 'no-cache',
    };

    if (req.method === 'HEAD') {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath)
      .on('error', function () { res.destroy(); })
      .pipe(res);
  });
});

function openBrowser(url) {
  // start is a cmd builtin on Windows; the empty "" is the window-title arg
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
}

let attempt = 0;

server.on('error', function (err) {
  if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_TRIES) {
    attempt++;
    console.log('Port ' + (START_PORT + attempt - 1) + ' in use, trying ' + (START_PORT + attempt) + '...');
    server.listen(START_PORT + attempt);
    return;
  }
  console.error('Server error:', err.message);
  process.exit(1);
});

server.listen(START_PORT, function () {
  const url = 'http://localhost:' + server.address().port + '/';
  console.log('');
  console.log('  Portfolio running at ' + url);
  console.log('  Serving ' + ROOT);
  console.log('  Press Ctrl+C to stop');
  console.log('');
  if (OPEN) { openBrowser(url); }
});

process.on('SIGINT', function () {
  console.log('\nStopped.');
  server.close(function () { process.exit(0); });
});
