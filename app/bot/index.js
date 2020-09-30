// *** Slack 瀏覽器通知機器人 ***
// 此服務用於每日觸發爬蟲取得瀏覽器版本，並發送訊息至slack

const cheerio = require('cheerio')
const request = require('request')
const dayjs = require('dayjs')
const store = require('../../database/store')

const STAGE = global.STAGE
const testData = require('../../test/testData')

const SLACK_PROD_URL = 'https://hooks.slack.com/services/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'
const SLACK_DEV_URL = 'https://hooks.slack.com/services/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'

const URLS_PROD = [
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/chrome?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Chrome'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/firefox?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Firefox'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/edge?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Edge'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/safari?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Safari'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/opera?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Opera'},
]
const URLS_DEV = [
  {url: '', platform: 'Chrome'},
  {url: '', platform: 'Firefox'},
]

module.exports = async (req, res) => {
  getVersionData()

  let message = `取得${dayjs().format('YYYY/MM/DD')} 的更新資訊中，請稍候…`;
  res.status(200).send(message);
}

async function getVersionData () {
  let urls = (STAGE === 'prod') ? URLS_PROD : URLS_DEV

  for (let url of urls) {
    await setTimeout(() => {
      webCrawler(url)
    }, 500)
  }
}

function webCrawler (url) {
  if (STAGE === 'prod') {
    request(url.url, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        const $ = cheerio.load(body)

        let versionNumbers = []
        $('#content .table tbody tr').each(function(i, elem) {
          versionNumbers.push($(this).text().split('\n'))
        })

        let result = store.parsePushData(versionNumbers, url.platform)

        sendToSlack(settingMessage(result, url.platform))
      } else {
        console.log(`爬蟲出錯誤了！！ ${err}`)
      }
    })
  }
  // 為避免測試太多次爬蟲被黑名單，開發模式使用寫死的測試資料
  else if (STAGE === 'dev') {
    let data = []

    if (url.platform === 'Chrome') data = testData.chrome
    else if (url.platform === 'Firefox') data = testData.firefox

    let result = store.parsePushData(data, url.platform)

    sendToSlack(result, url.platform)
  }
}

function settingMessage (messages, platform) {
  let count = 0
  let result = `平台： ${platform}\n`

  for (let item of messages) {
    let today = dayjs()
    let updateDay = (platform === 'Firefox') ? dayjs(item[4]) : dayjs(item[3])

    if (today.diff(updateDay, 'day') <= 7) {
      if (platform === 'Firefox') result += `瀏覽器：${item[1].trim()} on ${item[2].trim()}\t版本：${item[3].trim()}\t更新日期：${item[4].trim()} ${isNearDay(item[3])}\n`
      else result += `瀏覽器：${item[1].trim()}\t版本：${item[2].trim()}\t更新日期：${item[3].trim()} ${isNearDay(item[3])}\n`

      count += 1
    }
  }

  if (count === 0) result += '`此平台近七天沒有更新！！！`\n'

  return result
}

function sendToSlack (browserDatas, platform) {
  let messages = settingMessage(browserDatas, platform)

  let result = {
    text: messages
  }
  let options = {
    url: (STAGE === 'prod') ? SLACK_PROD_URL : SLACK_DEV_URL,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(result)
  }

  request(options, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      store.appendUnrecordData(browserDatas, platform)
    } else {
      console.log(`傳送資料至Slack出錯誤了！！ ${err}`)
    }
  })
}

function isNearDay (messageTime) {
  let today = dayjs()
  let updateDay = dayjs(messageTime)

  if (today.diff(updateDay, 'day') === 0) return '`(今日更新)`'
  else if (today.diff(updateDay, 'day') <= 3) return '`(距今三天內)`'
  else return ''
}