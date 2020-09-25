const bot = require('./bot')
const express = require('express')

const PORT = 8080

// App
const app = express()
app.get('/', function (req, res) {
  bot(req, res)
})

app.listen(PORT)
console.log('Running on http://localhost:' + PORT)