const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.ts',
    mode: isProduction ? 'production' : 'development',
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    output: {
      publicPath: isProduction ? '/' : 'http://localhost:3000/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'shell',
        remotes: {
          authMf: isProduction 
            ? 'authMf@/auth/remoteEntry.js'
            : 'authMf@http://localhost:3001/remoteEntry.js',
          classesMf: isProduction
            ? 'classesMf@/classes/remoteEntry.js'
            : 'classesMf@http://localhost:3002/remoteEntry.js',
          routinesMf: isProduction
            ? 'routinesMf@/routines/remoteEntry.js'
            : 'routinesMf@http://localhost:3003/remoteEntry.js',
          sharedMf: isProduction
            ? 'sharedMf@/shared/remoteEntry.js'
            : 'sharedMf@http://localhost:3004/remoteEntry.js',
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-router-dom': {
            singleton: true,
          },
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
  };
};
