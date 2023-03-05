const path = require('path');

module.exports = {
    entry: {
        sky: './client/login.jsx',
        sky: {
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
        filename: 'my_[name].js',
    },
    cache:{
        type: 'filesystem'
    }
};