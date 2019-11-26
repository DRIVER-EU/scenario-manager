const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins

const title = 'Taalgenie';
// Since we use the scripts folder, define the 'src' folder as the main point of entry
// Most paths are derived from there, e.g. the HTML-loader also uses it to resolve image paths.
const context = path.resolve(__dirname, '../src');

module.exports = {
  context,
  entry: {
    app: './app.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            reportFiles: ['src/**/*.{ts,tsx}'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1, // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'url-loader?limit=8192', // 'file-loader' is used as url-loader fallback anyways
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|pdf)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              root: path.resolve(context, 'assets'),
              attrs: [':data-src', 'a:href'],
            },
          },
          {
            loader: 'markdown-loader',
            options: {
              pedantic: true,
              gfm: true,
              tables: true,
              breaks: false,
              pedantic: false,
              sanitize: false,
              smartLists: true,
              smartypants: true,
              headerIds: true,
              headerPrefix: 'header-',
              langPrefix: 'lang-',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.mjs'],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ title: title, favicon: './assets/favicon.ico' }),
  ],
};
