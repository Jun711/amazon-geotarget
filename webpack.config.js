const path = require('path');

module.exports = {
  entry: {
    app: ['babel-polyfill', './src/amazonGeotarget.js'],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'amazonGeotarget.bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['env'],
      },
    }],
  },
};
