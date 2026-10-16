import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 8124);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const run = promisify(execFile);
createServer(async (request, response) => {
  try {
    if (request.url === '/favicon.ico') return response.writeHead(204).end();
    if (request.url.startsWith('/local/bubble/bubble-modules.yaml')) {
      response.setHeader('Content-Type', 'text/plain');
      return response.end('{}');
    }
    // Read the pinned upstream asset from retained Git history, without shipping
    // a second copy of the original bundle in Lovely Card's distribution.
    if (request.url === '/docs/preview/upstream.js') {
      const { stdout } = await run('git', ['show', '91a5c77:dist/bubble-card.js'], { cwd: root, maxBuffer: 12 * 1024 * 1024 });
      response.setHeader('Content-Type', 'text/javascript');
      return response.end(stdout);
    }
    let path = resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
    if (path !== root && !path.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    response.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`Lovely Card gallery: http://localhost:${port}/docs/preview/`));
