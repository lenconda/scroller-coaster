const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        demo: './src/demo.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'demo'),
        filename: '[name].js',
        publicPath: '/',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: 'esbuild-loader',
                exclude: /node_modules/,
                options: {
                    tsconfig: './tsconfig.json',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    devServer: {
        // contentBase: path.join(__dirname, 'demo'),
        compress: true,
        port: 9000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './demo/index.html',
        }),
    ],
};
