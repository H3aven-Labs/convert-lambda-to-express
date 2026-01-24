import { build } from 'esbuild';

const isDarwin = process.platform === 'darwin';

const externals = [
  '@aws-sdk/credential-providers',
  'chokidar',
  'cors',
  'express',
  'helmet',
  'jsonwebtoken',
  'morgan',
  'nodemon',
];

if (!isDarwin) {
  externals.push('fsevents', 'async_hooks');
}

await build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: './dist/index.js',
  minify: true,
  drop: ['console'],
  external: externals,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  tsconfig: './tsconfig.json',
});
