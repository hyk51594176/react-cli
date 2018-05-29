import '@babel/polyfill'
import 'url-polyfill'
import dva from 'dva'

import createHistory from 'history/createHashHistory'
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading'
import 'moment/locale/zh-cn'
import 'src/rollbar'

import 'src/index.less'
import globalModel from 'src/models/global'
import request from 'src/utils/request'

// 1. Initialize

const app = dva({
  history: createHistory()
})
console.log('我是app')
// 2. Plugins
app.use(createLoading())

// 3. Register global model
app.model(globalModel)

// 4. Router
app.router(require('src/router').default)
request.store = app._store
// 5. Start
app.start('#app')
