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
  target: ["node"],
  cache: false,
  resolve: {
    extensions: [".ts", ".js", ".json"],    
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
