const sha1 = require('sha1')

module.exports = {
  sha1BrowserInfoStringFormatter: sha1BrowserInfoStringFormatter,
  browserStringFormatter: browserStringFormatter,
  browserVersionFormatter: browserVersionFormatter,
  browserUpdateDateFormatter: browserUpdateDateFormatter,
}

function sha1BrowserInfoStringFormatter (item, platform) {
  if (platform === 'Firefox') return sha1(`${platform}${item[1]} on ${item[2]}${item[3]}${item[4]}`)
  else return sha1(platform + item[1] + item[2] + item[3])
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