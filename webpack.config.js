const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.module\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                namedExport: true,
                localIdentHashSalt: '5231577681055346', // make unique for each package
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    globalObject: 'this',
    library: {
      name: 'copyInterface',
      type: 'umd',
    },
    clean: true,
  },
};
