import '@babel/polyfill'
import 'url-polyfill'
import dva from 'dva'

import createHistory from 'history/createHashHistory'
// user BrowserHistory
import createLoading from 'dva-loading'
import 'moment/locale/zh-cn'
import 'src/rollbar'
import globalModel from 'src/models/global'
import request from 'src/utils/request'
import 'src/index.less'
console.log('我是test')
// 1. Initialize
const app = dva({
  history: createHistory()
})

// 2. Plugins
app.use(createLoading())

// 3. Register global model
app.model(globalModel)

// 4. Router
app.router(require('src/router').default)
request.store = app._store
// 5. Start
app.start('#app')
