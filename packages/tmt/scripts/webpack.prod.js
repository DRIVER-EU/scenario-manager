const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: 'production',
  watch: false,
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../docs'),
    publicPath: 'https://erikvullings.github.io/taalgenie/',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin(['../docs']),
    // new BundleAnalyzerPlugin(),
  ]
});
