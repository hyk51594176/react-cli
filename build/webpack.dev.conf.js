'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// friendly-errors-webpack-plugin用于更友好地输出webpack的警告、错误等信息
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const apiMocker = require('webpack-api-mocker')
const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  devServer: {
    clientLogLevel: 'warning',
    // 在使用 HTML5 History API时需要定义路由跳转指向
    historyApiFallback: {
      // rewrites: [
      //   { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') }
      // ]
      rewrites: Object.keys(baseWebpackConfig.entry).map(entry => {
        return { from: new RegExp('/' + entry + '.html.*'), to: path.posix.join(config.dev.assetsPublicPath, entry + '.html') }
      })
    },
    hot: true, // 启用webpack的热模块更换功能：
    contentBase: false, // 静态资源文件夹 这里用CopyWebpackPlugin插件，所以关闭此选项
    compress: true, // 为服务的所有内容启用gzip压缩：
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser, // 当open启用时，开发服务器将打开浏览器
    overlay: config.dev.errorOverlay // 当出现编译器错误或警告时，在浏览器中显示全屏叠加
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable, //  代理
    quiet: true, // 除了初始启动信息之外，什么也不会写入控制台。这也意味着WebPACK中的错误或警告是不可见的。
    watchOptions: {
      poll: config.dev.poll
    },
    before (app) { // 提供在服务器内部的所有其他中间件之前执行定制中间件的功能。这可以用来定义自定义处理程序
      apiMocker(app, path.resolve(__dirname, '../mock/index.js'))
    }
  },
  plugins: [
    // 允许你创建一个在编译时可以配置的全局常量
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(), // 启用热替换模块(Hot Module Replacement)，也被称为 HMR。
    new webpack.NamedModulesPlugin(), // 当开启 HMR 的时候使用该插件会显示模块的相对路径
    new webpack.NoEmitOnErrorsPlugin(), // 在编译出现错误时，使用 NoEmitOnErrorsPlugin 来跳过输出阶段。这样可以确保输出资源不会包含错误
    // 将单个文件或整个目录复制到生成目录
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ].concat(utils.htmls())
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`]
        },
        onErrors: config.dev.notifyOnErrors ? utils.createNotifierCallback() : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
