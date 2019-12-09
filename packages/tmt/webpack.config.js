const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env = {}) => {
  const plugins = [
    new HtmlWebpackPlugin({
      meta: {
        description: 'Boobook, an online scenario or playbook editor and executing environment.',
      },
      title: 'Boobook',
      favicon: './src/assets/favicon.ico',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ];
  if (!env.production) {
    plugins.push(
      new webpack.DefinePlugin({
        SERVICE_URL: JSON.stringify('http://localhost:3210'),
      })
    );
  }

  return {
    entry: './src/index.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dist',
      hot: true,
    },
    plugins,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'awesome-typescript-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ['file-loader'],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: ['file-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
};
