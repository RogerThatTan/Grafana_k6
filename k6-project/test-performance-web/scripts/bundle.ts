import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';

const entry = process.argv[2];
if (!entry) {
  throw new Error('Usage: npm run build -- <entry-file>');
}

const absoluteEntry = resolve(entry);
const output = join('dist', basename(absoluteEntry, '.ts') + '.js');
await mkdir(dirname(output), { recursive: true });

await build({
  entryPoints: [absoluteEntry],
  bundle: true,
  outfile: output,
  platform: 'neutral',
  format: 'esm',
  target: 'es2020',
  external: ['k6', 'k6/*'],
});

console.log(`Built ${output}`);
