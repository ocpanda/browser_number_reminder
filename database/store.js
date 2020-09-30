const helper = require('../helper')
const fs = require('fs')

const STAGE = global.STAGE
const DATA_PATH = (STAGE === 'prod') ? './database/history.json' : './database/history-test.json'

module.exports = {
  init: executeInit,
  parsePushData: parsePushData,
  appendUnrecordData: appendUnrecordData,
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

async function appendUnrecordData (datas, platform) {
  let historyData = getHistory()
  for (let item of datas) {
    let result = {
      "platform": platform,
      "browser": helper.browserStringFormatter(item, platform),
      "version": helper.browserVersionFormatter(item, platform),
      "date": helper.browserUpdateDateFormatter(item, platform),
      "hasPush": true,
    }
    let str = helper.sha1BrowserInfoStringFormatter(item, platform)
    historyData[str] = result
  }
  try {
    await writeFile(historyData)
  } catch (e) {
    console.log(e)
  }
}

async function executeInit () {
  try {
    if (!isFileExist()) await createFile()
  } catch (e) {
    console.log(e)
  }
}

function isFileExist () {
  if (fs.existsSync(DATA_PATH)) return true
  else return false
}

async function createFile () {
  await fs.writeFile(DATA_PATH, JSON.stringify({}), (err) => {
    if (err) throw err
    console.log('已成功建立瀏覽器版本歷史檔')
  })
}

async function writeFile (data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data), (err) => {
    if(err) throw err
    console.log('成功寫入歷史資料')
  })
}

function getHistory () {
  let data = readFile()

  return JSON.parse(data)
}

function readFile () {
  return fs.readFileSync(DATA_PATH, 'utf8')
}