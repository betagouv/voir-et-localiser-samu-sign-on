const bodyParser = require('body-parser');
const express = require('express');
const { mustache } = require('consolidate');

const { User } = require('./models');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 10101;

app.engine('html', mustache);
app.set('view engine', 'html');
app.listen(port, () => {
  console.log('Server listening on port %d', port);
});

app.get('/', (req, res) => {
  return res.render('index');
  res.render('index');
});

function validateUser(req, res, next) {
  User.findOne({ where: { email: req.body.username }})
  .then(user => {
    if (! user) {
      return res.render('index', { error: 'Email inconnu' });
    }

    next();
  });
}

app.get('/users', (req, res) => {
  User.findAll().then(users => res.render('users/list', { users }))
});

app.post('/', validateUser, (req, res) => {
  res.json(req.body);
});
