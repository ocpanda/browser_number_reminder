// 設定模式 正式 prod, 開發 dev
const DEV = 'dev'
const PROD = 'prod'
global.STAGE = DEV

const bot = require('./app/bot')
const store = require('./database/store')
const express = require('express')

const PORT = 8080

// App
const app = express()
app.get('/', async (req, res) => {
  await store.init()
  await bot(req, res)
})

app.listen(PORT)
console.log('Running on http://localhost:' + PORT)