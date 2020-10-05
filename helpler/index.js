const sha1 = require('sha1')
const dayjs = require('dayjs')
const fs = require('fs')

module.exports = {
  sha1BrowserInfoStringFormatter: sha1BrowserInfoStringFormatter,
  browserStringFormatter: browserStringFormatter,
  browserVersionFormatter: browserVersionFormatter,
  browserUpdateDateFormatter: browserUpdateDateFormatter,
  sendLog: sendLog,
}

function sha1BrowserInfoStringFormatter (item, platform, isRePush = false) {
  if (!isRePush) {
    if (platform === 'Firefox') return sha1(`${platform}${item[1]} on ${item[2]}${item[3]}${item[4]}`)
    else return sha1(platform + item[1] + item[2] + item[3])
  } else {
    return sha1(platform + item.browser + item.version + item.date)
  }
}

function browserStringFormatter (item, platform) {
  if (platform === 'Firefox') return `${item[1]} on ${item[2]}`
  else return item[1]
}

function browserVersionFormatter (item, platform) {
  if (platform === 'Firefox') return item[3]
  else return item[2]
}

function browserUpdateDateFormatter (item, platform) {
  if (platform === 'Firefox') return item[4].trim()
  else return item[3].trim()
}

async function sendLog (str) {
  let time = dayjs().format('YYYY-MM-DD HH:mm:ss')
  await appendFile(`${time} > ${str}\n`)
  console.log(`${time} > ${str}`)

  async function appendFile (data) {
    const LOG_FILE = 'app.log'

    if (!fs.existsSync(LOG_FILE)) {
      await fs.writeFile(LOG_FILE, '', async (err) => {
        if (err) throw err
        await sendLog('已成功建立瀏覽器版本歷史檔')
      })
    }

    await fs.appendFile(LOG_FILE, data, (err) => {
      if (err) throw err
    })
  }
}