const helper = require('../helpler')
const fs = require('fs')

const STAGE = global.STAGE
const DATA_PATH = (STAGE === 'prod') ? './database/history.json' : './database/history-test.json'

module.exports = {
  init: executeInit,
  parsePushData: parsePushData,
  appendUnrecordData: appendUnrecordData,
  writeHistoryFile: writeFile,
  getHistory: getHistory,
  isHistoryFileExist: isHistoryFileExist,
}

// 篩選出未被加入到history.json的資料
function parsePushData (data, platform) {
  let result = []

  for (let item of data) {
    let hashKey = ''

    if (platform === 'Firefox') {
      hashKey = helper.sha1BrowserInfoStringFormatter(item, platform)
    } else {
      hashKey = helper.sha1BrowserInfoStringFormatter(item, platform)
    }
    let historyData = getHistory()

    if (!historyData.hasOwnProperty(hashKey)) result.push(item)
  }

  return result
}

async function appendUnrecordData (datas, platform, hasPush = true, isRePush = false) {
  let historyData = getHistory()
  for (let item of datas) {
    let result = {
      "platform": platform,
      "browser": (!isRePush) ? helper.browserStringFormatter(item, platform) : item.browser,
      "version": (!isRePush) ? helper.browserVersionFormatter(item, platform) : item.version,
      "date": (!isRePush) ? helper.browserUpdateDateFormatter(item, platform) : item.date,
      "hasPush": hasPush,
    }
    let str = helper.sha1BrowserInfoStringFormatter(item, platform, isRePush)
    historyData[str] = result
  }
  try {
    await writeFile(historyData)
  } catch (e) {
    await helper.sendLog(e)
  }
}

async function executeInit () {
  try {
    if (!isHistoryFileExist()) await createFile()
  } catch (e) {
    await helper.sendLog(e)
  }
}

function isHistoryFileExist () {
  if (fs.existsSync(DATA_PATH)) return true
  else return false
}

async function createFile () {
  await fs.writeFile(DATA_PATH, JSON.stringify({}), async (err) => {
    if (err) throw err
    await helper.sendLog('已成功建立瀏覽器版本歷史檔')
  })
}

async function writeFile (data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data), async (err) => {
    if(err) throw err
    await helper.sendLog(`成功寫入歷史資料 ${JSON.stringify(data)}`)
  })
}

function getHistory () {
  let data = readFile()

  return JSON.parse(data)
}

function readFile () {
  return fs.readFileSync(DATA_PATH, 'utf8')
}