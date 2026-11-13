import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

for (const file of readdirSync('js')) {
  if (file.endsWith('.js')) {
    execFileSync(process.execPath, ['--check', 'js/' + file]);
  }
}
mkdirSync('build', { recursive: true });
for (const entry of ['index.html', 'js', 'style', 'meta', 'favicon.ico', 'LICENSE.txt']) {
  cpSync(entry, 'build/' + entry, { recursive: true });
}
console.log('Build complete: JavaScript syntax checked and static app assembled in build/.');
