'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var glob = require('glob')
exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options, isModel) {
  options = options || {}
  const modes = {
    modules: true,
    localIdentName: process.env.NODE_ENV === 'development'
      ? '[name]__[local]___[hash:base64:5]'
      : '[local]___[hash:base64:5]'
  }
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap,
      ...(isModel ? modes : {})
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'style-loader'
      })
    } else {
      return ['style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  const loaders2 = config.cssmodules ? exports.cssLoaders(options, true) : null
  for (const extension in loaders) {
    const loader = loaders[extension]
    if (loaders2) {
      const loader2 = loaders2[extension]
      output.push({
        test: new RegExp('\\.' + extension + '$'),
        use: loader2,
        exclude: /node_modules/
      })
    }
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader,
      ...(loaders2 ? {include: /node_modules/} : {})
    })
  }
  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

exports.getEntry = () => {
  const entrys = {}
  glob.sync('./src/pages/*.js').forEach(function (entry) {
    const arr = entry.split('/')
    const key = arr[arr.length - 1].replace('.js', '')
    entrys[key] = entry
  })
  return entrys
}
exports.htmls = () => {
  return Object.keys(exports.getEntry()).map(entry => {
    // 生成html文件
    return new HtmlWebpackPlugin({
      filename: entry + '.html',
      template: 'index.html',
      title: entry,
      inject: true, // 注入选项。有四个选项值 true, body, head, false. true 默认值，script标签位于html文件的 body 底部 ,body 同 true,head script 标签位于 head 标签内,false 不插入生成的 js 文件，只是单纯的生成一个 html 文件
      chunks: ['manifest', 'vendor', entry],
      hash: true
    })
  })
}
