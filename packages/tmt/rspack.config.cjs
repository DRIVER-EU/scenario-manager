const path = require('path');
const devMode = process.env.NODE_ENV === 'development';
const outputPath = path.resolve(process.cwd(), devMode ? 'dist' : 'dist');

require('dotenv').config();

console.log(`Working in ${devMode ? 'development' : 'production'} mode.`);

module.exports = {
  mode: devMode ? 'development' : 'production',
  entry: {
    main: './src/app.ts',
  },
  devServer: {
    port: 3388,
  },
  builtins: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.SERVER': JSON.stringify(devMode ? process.env.SERVER : ''),
    },
    html: [
      {
        title: 'Trial Management Tool',
        publicPath: devMode ? '' : '/tmt/',
        scriptLoading: 'defer',
        minify: !devMode,
        favicon: './favicon.ico',
        meta: {
          viewport: 'width=device-width, initial-scale=1',
          'og:title': 'Trial Management Tool',
          'og:description': 'Create a scenario and run it.',
          'og:url': 'https://github.com/DRIVER-EU/scenario-manager',
          'og:site_name': 'Trial Management Tool',
          'og:image:alt': 'Trial Management Tool',
          'og:image': './src/assets/logo.svg',
          'og:image:type': 'image/svg',
          'og:image:width': '200',
          'og:image:height': '200',
          'og:locale': 'en_UK',
        },
      },
    ],
    minifyOptions: devMode
      ? undefined
      : {
          passes: 3,
          dropConsole: false,
        },
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /^BUILD_ID$/,
        type: 'asset/source',
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: outputPath,
  },
};
