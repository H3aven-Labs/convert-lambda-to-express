'use strict';

import { execSync } from 'child_process';
import fs from 'fs';

import packageJson from './package.json';
import webpackConfig from './webpack.config';

fs.copyFileSync('./package.json', './package.bkp.json');

const externals = Object.keys(webpackConfig.externals);

delete packageJson['scripts'];
delete packageJson['devDependencies'];
delete packageJson['resolutions'];

const dependencies = Object.keys(packageJson['dependencies'])
  .filter(dependency => externals.includes(dependency))
  .reduce((prev, current) => {
    prev[current] = packageJson['dependencies'][current];

    return prev;
  }, {});

packageJson['dependencies'] = dependencies;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

try {
  execSync('npm publish', { stdio: 'inherit' });
} catch (err) {
  console.error(err);
}
fs.unlinkSync('./package.json');
fs.renameSync('./package.bkp.json', './package.json');
