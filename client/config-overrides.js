const assert = require('assert');
const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "url": require.resolve("url/"),
        "process": require.resolve("process/browser"),
        "buffer": require.resolve("buffer/"),
        "path": require.resolve("path-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "querystring": require.resolve("querystring-es3"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "http": require.resolve("stream-http"), 
        "util": require.resolve("util/"),
        "assert":require.resolve("assert/"),
        "fs": require.resolve("browserify-fs"),
        "net": require.resolve("net-browserify"),
        'vm':require.resolve("vm-browserify"),
        
        

    };
    
    
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],

        }),

        
          
    ]);

    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    });

   

  
    return config;
};
