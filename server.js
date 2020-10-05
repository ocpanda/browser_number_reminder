// 設定模式 正式 prod, 開發 dev
const DEV = 'dev'
const PROD = 'prod'
global.STAGE = DEV

const SLACK_PROD_URL = 'https://hooks.slack.com/services/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'
const SLACK_DEV_URL = 'https://hooks.slack.com/services/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'
global.SLACK_URL = (global.STAGE === 'prod') ? SLACK_PROD_URL : SLACK_DEV_URL

const bot = require('./app/bot')
const scanner = require('./app/scanner')
const store = require('./database/store')
const express = require('express')

const PORT = 8080

// App
const app = express()

// 爬蟲機器人
app.get('/', async (req, res) => {
  await store.init()
  await bot.exec(req, res)
})

// 歷史資料回補機器人
app.get('/scanner', async (req, res) => {
  await scanner(req, res)
})

app.listen(PORT)
console.log('Running on http://localhost:' + PORT)