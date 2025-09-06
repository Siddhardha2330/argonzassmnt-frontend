const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/',
      clean: true,
      assetModuleFilename: '[name][ext]'
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: true,
        filename: 'index.html'
      }),
      new webpack.DefinePlugin({
        'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '')
      })
    ],
    devServer: {
      historyApiFallback: true,
      port: 3000,
      hot: true,
      open: true,
      proxy: {
        '/api': 'http://localhost:4000'
      }
    }
  };
};
