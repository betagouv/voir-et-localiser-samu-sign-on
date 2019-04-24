const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const { mustache } = require('consolidate');
const { cookieSecret } = require('./config');

const { User } = require('./models');
const { validateUser } = require('./middlewares/auth');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(cookieSecret));

const port = 10101;

app.engine('html', mustache);
app.set('view engine', 'html');
app.listen(port, () => {
  console.log('Server listening on port %d', port); // eslint-disable-line
});

function attachSessionUser(req, res, next) {
  if (!req.signedCookies.user) {
    return next();
  }

  return User.findOne({
    where: {
      id: req.signedCookies.user,
    },
  }).then((u) => {
    req.user = u;
    next();
  });
}

function redirectUser(req, res, next) {
  if (!req.user) {
    return next();
  }

  if (req.query.redirect_uri) {
    return res.redirect(`${req.query.redirect_uri}?code=${req.user.id}`);
  }

  return res.redirect('users');
}

function storeUserInSession(req, res, next) {
  res.cookie('user', req.user.id, {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    signed: true,
  });
  return next();
}

app.get('/', attachSessionUser, redirectUser, (req, res) => {
  res.render('index');
});

app.post('/', validateUser, storeUserInSession, redirectUser);

app.get('/users', (req, res) => {
  User.findAll().then(users => res.render('users/list', { users }));
});

app.get('/users/new', (req, res) => {
  res.render('users/new');
});

app.post('/users/new', (req, res, next) => {
  User.create({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
    unit: req.body.unit,
    department: req.body.department,
  }).then((user) => {
    req.user = user;
  }).then(() => {
    next();
  }).catch((e) => {
    res.render('users/new', { error: e });
  });
}, storeUserInSession, (req, res) => {
  res.redirect('/users');
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
    if (user.isValidator || user.ValidatorId) {
      return res.json(user);
    }

    return res.status(401).send({ error: 'validation required' });
  });
});
