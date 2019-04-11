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
  if (req.query.redirect_uri) {
    return res.redirect(`${req.query.redirect_uri}?code=${req.user.id}`);
  }
  res.json({ login: 'ok', userId: req.user.id });
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
    role: req.body.role,
    unit: req.body.unit,
    department: req.body.department,
  }).then((u) => {
    res.redirect('/users');
  }).catch((e) => {
    console.log(e);
    res.render('users/new', { error: e });
  });
});

function getToken(req, res, next) {
  const header = req.get('Authorization');
  if (!header/* missing token */) {
    return res.json({ error: 'missing token' });
  }

  const code = parseInt(header.replace('Bearer', ''), 10);
  if (code.isNaN) {
    return res.json({ error: 'unvalid token' });
  }

  req.token = code;
  return next();
}

app.get('/api/userinfo', getToken, (req, res) => {
  User.findOne({
    where: {
      id: req.token,
    },
    attributes: { exclude: ['password'] },
  }).then((user) => {
    res.json(user);
  });
});
