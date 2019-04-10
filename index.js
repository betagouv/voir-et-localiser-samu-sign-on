const { mustache } = require('consolidate');
const express = require('express');

const app = express();
const port = 10101;

app.engine('html', mustache);
app.set('view engine', 'html');
app.listen(port, () => {
  console.log('Server listening on port %d', port);
});

app.get('/', (req, res) => {
  res.render('index');
});
