import h3 from '@h3aven-labs/h3-eslint';

export default [
  ...h3.backend({
    ignores: ['.webpack', 'node_modules*'],
  }),
];
