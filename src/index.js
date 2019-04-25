const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const { cookieSecret } = require('./config');

const { Code, User, sequelize } = require('./models');

const { validateUser } = require('./middlewares/auth');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(cookieSecret));

const port = 10101;

app.set('view engine', 'ejs');
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log('Server listening on port %d', port); // eslint-disable-line
  });
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
    return Code.create({ userId: req.user.id }).then((code) => {
      res.redirect(`${req.query.redirect_uri}?code=${code.id}`);
    });
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
  if (!header) {
    return res.json({ error: 'Entête d’authentification manquant' });
  }

  if (!header.startsWith('Bearer: ')) {
    return res.json({ error: 'Entête d’authentification invalide' });
  }

  req.token = header.slice('Bearer: '.length);
  return next();
}

app.get('/api/userinfo', getToken, (req, res) => {
  Code.findOne({
    where: {
      id: Buffer.from(req.token, 'base64'),
    },
  }).then((token) => {
    if (!token) {
      return res.status(404).send({ error: 'Token inconnu' });
    }

    return User.findOne({
      where: {
        id: token.userId,
      },
      attributes: { exclude: ['password'] },
    }).then((user) => {
      if (user.isValidator || user.ValidatorId) {
        return res.json(user);
      }

      return res.status(401).send({ error: 'Validation nécessaire' });
    });
  });
});


app.post('/api/access_token', (req, res) => {
  if (!req.body.code) {
    return res.status(404).send({ error: 'Code manquant' });
  }

  Code.findOne({
    where: {
      id: Buffer.from(req.body.code, 'base64'),
    },
  }).then((code) => {
    if (!code) {
      return res.status(404).send({ error: 'Code inconnu' });
    }

    res.send({
      access_token: code.id,
    });
  });
});
