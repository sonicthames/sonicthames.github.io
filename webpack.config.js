require("dotenv").config();

const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InterpolateHtmlPlugin = require("interpolate-html-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const DefinePlugin = webpack.DefinePlugin;

const PORT = 3001;

module.exports = function (_, argv) {
  return {
    entry: path.resolve(__dirname, "./src/index.tsx"),
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      historyApiFallback: true,
      port: PORT,
    },
    output: {
      publicPath: "auto",
    },
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack", "url-loader"],
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ["babel-loader"],
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {
            // disable type checker - we will use it in fork plugin
            transpileOnly: true,
          },
        },
      ],
    },
    devtool: argv.mode === "development" ? "source-map" : undefined,
    optimization:
      argv.mode === "production"
        ? {
            minimize: true,
            minimizer: [new TerserPlugin()],
          }
        : {},
    plugins: [
      new DefinePlugin({
        "process.env.REACT_APP_MAPBOX_TOKEN": JSON.stringify(
          process.env.REACT_APP_MAPBOX_TOKEN
        ),
        "process.env.NODE_ENV": JSON.stringify(argv.mode),
      }),
      new HtmlWebpackPlugin({
        manifest: "./public/manifest.json",
        favicon: "./public/favicon.ico",
        template: "./public/index.html",
      }),
      new ForkTsCheckerWebpackPlugin(),
      new InterpolateHtmlPlugin({
        PUBLIC_URL: "",
      }),
    ].concat(argv.mode === "production" ? [] : []),
  };
};
