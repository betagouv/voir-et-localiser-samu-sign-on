var express = require('express');
var app = express();

var port = 10101;
app.listen(port, function () {
    console.log('Server listening on port %d', port);
});
