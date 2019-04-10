var mustache = require('consolidate').mustache
var express = require('express')
var app = express()

var port = 10101

app.engine('html', mustache)
app.set('view engine', 'html')
app.listen(port, function () {
    console.log('Server listening on port %d', port)
})

app.get("/", function(req, res) {
  res.render('index')
})
