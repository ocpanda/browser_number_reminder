const cheerio = require('cheerio')
const request = require('request')
const dayjs = require('dayjs')

const urls = [
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/chrome?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Chrome'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/firefox?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Firefox'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/edge?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Edge'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/safari?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Safari'},
  {url: 'https://www.whatismybrowser.com/guides/the-latest-version/opera?utm_source=whatismybrowsercom&utm_medium=internal&utm_campaign=detect-index', platform: 'Opera'},
]

module.exports = (req, res) => {
  getVersionData()

  let message = `取得${dayjs().format('YYYY/MM/DD')} 的更新資訊中，請稍候…`;
  res.status(200).send(message);
}

async function getVersionData () {
  for (let url of urls) {
    await setTimeout(() => {
      webCrawler(url)
    }, 500)
  }
}

function webCrawler (url) {
  request(url.url, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      const $ = cheerio.load(body)

      let versionNumbers = []
      $('#content .table tbody tr').each(function(i, elem) {
        versionNumbers.push($(this).text().split('\n'))
      })

      sendToSlack(settingMessage(versionNumbers, url.platform))
    } else {
      console.log(`出錯誤了！！ ${err}`)
    }
  })
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

function sendToSlack (messages) {
  let result = {
    text: messages
  }
  let options = {
    url: 'https://hooks.slack.com/services/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',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(result)
  }

  request(options, (err, res, body) => {
    console.log(err, res, body)
  })
}

function isNearDay (messageTime) {
  let today = dayjs()
  let updateDay = dayjs(messageTime)

  if (today.diff(updateDay, 'day') === 0) return '`(今日更新)`'
  else if (today.diff(updateDay, 'day') <= 3) return '`(距今三天內)`'
  else return ''
}