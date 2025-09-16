const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');

const optionalPlugins = [];

if (process.platform !== "darwin") {
  optionalPlugins.push(
    new webpack.IgnorePlugin({ 
      resourceRegExp: /^fsevents|async\_hooks$/ 
    })
  );
}
module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  node: {
    __dirname: true,
  },
  cache: false,
  resolve: {
    extensions: [".ts", ".js", ".json"],
    fallback: {
      "assert": require.resolve("assert/"),
      "buffer": require.resolve("buffer/"),
      "crypto": require.resolve("crypto-browserify"),
      "fs": require.resolve("browserify-fs"),
      "http": require.resolve("stream-http"),
      "net": require.resolve("net-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "os": require.resolve("os-browserify/browser"),      
      "stream": require.resolve("stream-browserify"),      
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "url": require.resolve("url/"),
      "vm": require.resolve("vm-browserify"),
      "zlib": require.resolve("browserify-zlib"),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: { drop_console: true },
      },
    })],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader'            
          },
        ],
      },
    ],
  },
  plugins: [
    ...optionalPlugins,
    new webpack.ContextReplacementPlugin(
      /\/express/,
      (data) => {
        delete data.dependencies[0].critical;
        return data;
      },
    ),
  ],
  output: {
    globalObject: "this",
    libraryTarget: "commonjs2",
    path: path.join(__dirname, "dist"),
    filename: "index.js",
    clean: true
  },
};
