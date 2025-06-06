const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // AJOUT

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                // MODIFICATION: S'assurer que file-loader gère bien les noms
                // et que CopyWebpackPlugin gère spécifiquement la favicon.
                // On peut laisser file-loader pour les images importées en JS/CSS.
                type: 'asset/resource', // Utiliser asset modules de Webpack 5
                generator: {
                    filename: 'assets/images/[hash][ext][query]'
                }
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
        port: 8080,
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:3000',
                secure: false
            }
        ],
        static: {
            directory: path.join(__dirname, 'public') // Pour d'autres fichiers statiques si besoin
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        // AJOUT : Copier la favicon
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets/favicon.png', to: 'favicon.png' }, // Copie à la racine de dist
            ],
        }),
    ]
};