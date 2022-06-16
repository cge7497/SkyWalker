const path = require('path');

module.exports = {
    entry: {
        page: './client/login.jsx',
        page: {
            import: './client/login.jsx',
            dependOn: 'shared'
        },
        shared: 'three'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',
    },
    cache:{
        type: 'filesystem'
    }
};