'use strict';

var path = require('path');
var webpack = require('webpack');
var env = process.env.NODE_ENV;
// var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
    output: {
        path: path.join(__dirname, 'dist/'),
        // filename: '[name].js',
        library: 'Redaxtor-Medium',
        libraryTarget: 'umd'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        })
    ],
    devtool: "source-map",
    module: {
        loaders: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react'],
                    plugins: [
                        'babel-plugin-transform-object-rest-spread'
                    ]
                }
            },
            {
                test: /\.less$/,
                loaders: [
                    'style-loader',
                    'css-loader?-url&sourceMap',
                    'postcss-loader',
                    'less?sourceMap'
                ]
            }
        ],
        noParse: []
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.less']
    }
};

if (env === 'production') {
    config.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                screw_ie8: true,
                warnings: false
            }
        })
    )
}

module.exports = config;