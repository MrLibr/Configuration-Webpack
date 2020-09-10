const path = require( 'path' );
const { merge } = require( 'webpack-merge' );
const HTMLWebpackPlugin = require( 'html-webpack-plugin' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const OptimizeCssAssetWebpackPlugin = require( 'optimize-css-assets-webpack-plugin' );
const TerserWebpackPlugin = require( 'terser-webpack-plugin' );

module.exports = () => {
  const isDev = process.env.NODE_ENV === 'dev';
  const mode = process.env.NODE_ENV || 'dev';
  const baseConfig = require( `./webpack/webpack.config.${mode}.js` );

  //Optimization Config:
  const optimization = () => {
    const config = {
      minimizer: isDev ? [] : [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin()
    ],
      splitChunks: {
        chunks: 'all'
      }
    };

    return config;
  };

  // File Naming:
  const filename = ext => isDev ? `[name].bundle.${ext}` : `[name].[hash].${ext}`;

  // Base CSS Loader:
  const cssLoaders = extra => {
    const loaders = [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: isDev,
          reloadAll: true
        },
    },
    'css-loader',
  ]

    if ( extra ) {
      loaders.push( extra );
    }

    return loaders;
  }

  // Base Babel Loader:
  const babelOptions = ( ...arrayPresets ) => {
    const opts = {
      presets: [
      '@babel/preset-env'
    ],
      plugins: [
      '@babel/plugin-proposal-class-properties'
    ]
    }

    if ( arrayPresets.length ) {
      arrayPresets.forEach( preset => opts.presets.push( preset ) );
    }

    return opts;
  }

  // Plugin Config:
  const plugins = () => {
    const base = [
    new HTMLWebpackPlugin( {
        template: './index.html',
        minify: {
          collapseWhitespace: !isDev
        }
      } ),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin( {
        filename: filename( 'css' )
      } )
    ];

    if ( !isDev ) {
      base.push( new CopyWebpackPlugin( [ {
        from: path.resolve( __dirname, 'assets' ),
        to: path.resolve( __dirname, 'dist' )
    } ] ) )
    }

    return base;
  }

  return merge( {
      context: path.resolve( __dirname, 'src' ),
      entry: {
        main: [ '@babel/polyfill', './index.tsx' ],
      },
      output: {
        filename: filename( 'js' ),
        path: path.resolve( __dirname, 'dist' )
      },
      resolve: {
        modules: [ path.resolve( __dirname, './' ), 'node_modules' ],
        extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
        alias: {
          //  Aliases Witch Help Reduce Way From File
          // example:    '@': path.resolve( __dirname, 'src' )
        }
      },
      optimization: optimization(),
      devServer: {
        port: process.env.PORT,
        open: true,
        hot: isDev,
      },
      plugins: plugins(),
      module: {
        rules: [
          {
            test: /\.css$/,
            use: cssLoaders()
          },
          {
            test: /\.less$/,
            use: cssLoaders( 'less-loader' )
          },
          {
            test: /\.s[ac]ss$/,
            use: cssLoaders( 'sass-loader' )
          },
          {
            test: /\.(png|jpg|svg|gif)$/,
            use: [ 'file-loader' ]
          },
          {
            test: /\.(ttf|woff|woff2|eot)$/,
            use: [ 'file-loader' ]
          },
          {
            test: /\.xml$/,
            use: [ 'xml-loader' ]
          },
          {
            test: /\.csv$/,
            use: [ 'csv-loader' ]
          },
          {
            test: /\.js(x)?$/,
            exclude: /node_modules/,
            loader: {
              loader: 'babel-loader',
              options: babelOptions( '@babel/preset-react' )
            }
              },
          {
            test: /\.ts(x)?$/,
            exclude: /node_modules/,
            loader: {
              loader: 'babel-loader',
              options: babelOptions( '@babel/preset-react', '@babel/preset-typescript' )
            }
              }
            ]
      }
    },
    baseConfig );
}
