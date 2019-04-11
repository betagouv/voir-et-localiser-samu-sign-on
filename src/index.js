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

app.post('/', validateUser, (req, res) => {
  res.json(req.user);
});

app.get('/users', (req, res) => {
  User.findAll().then(users => res.render('users/list', { users }));
});

app.get('/users/new', (req, res) => {
  res.render('users/new');
});

app.post('/users/new', (req, res) => {
  User.create({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  }).then(u => {
    res.redirect('/users');
  }).catch(e => {
    console.log(e);
    res.render('users/new', { error: e });
  });
});
