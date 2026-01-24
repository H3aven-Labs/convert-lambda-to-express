import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

const optionalPlugins = [];

if (process.platform !== 'darwin') {
  optionalPlugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^fsevents|async_hooks$/,
    }),
  );
}

export default {
  mode: 'production',
  entry: './src/index.ts',
  node: {
    __dirname: true,
  },
  target: ['node'],
  cache: false,
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    ...optionalPlugins,
    new webpack.ContextReplacementPlugin(/\/express/, data => {
      delete data.dependencies[0].critical;
      return data;
    }),
  ],
  externals: {
    '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers',
    chokidar: 'commonjs chokidar',
    cors: 'commonjs cors',
    express: 'commonjs express',
    helmet: 'commonjs helmet',
    jsonwebtoken: 'commonjs jsonwebtoken',
    morgan: 'commonjs cors',
    nodemon: 'commonjs nodemon',
  },
  output: {
    globalObject: 'this',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    clean: true,
  },
};
