const bodyParser = require('body-parser');
const express = require('express');
const { mustache } = require('consolidate');

const { User } = require('./models');
const { validateUser } = require('./middlewares/auth');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 10101;

app.engine('html', mustache);
app.set('view engine', 'html');
app.listen(port, () => {
  console.log('Server listening on port %d', port); // eslint-disable-line
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/users', (req, res) => {
  User.findAll().then(users => res.render('users/list', { users }));
});

app.post('/', validateUser, (req, res) => {
  res.json(req.user);
});
