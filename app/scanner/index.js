const helper = require('../../helpler')
const store = require('../../database/store')
const bot = require('../bot')

module.exports = async (req, res) => {
  await exec()

  let message = `進行歷史資料回補中，請稍候…`;
  res.status(200).send(message);
}

async function exec () {
  if (store.isHistoryFileExist()) {
    await scanHistoryData()
  } else await helper.sendLog('歷史檔不存在！')
}

async function scanHistoryData () {
  let history = store.getHistory()
  let pushList = {}

  for (let key in history) {
    let item = history[key]

    if (item.hasPush === false) {
      if (pushList.hasOwnProperty(item.platform)) {
        pushList[item.platform].push(item)
      } else {
        pushList[item.platform] = [item]
      }
      item.hasPush = true
    }
  }

  await store.writeHistoryFile(history)
  if (Object.entries(pushList).length !== 0) {
    for (let platform in pushList) {
      bot.sendToSlack(pushList[platform], platform, true)
    }
  }
}