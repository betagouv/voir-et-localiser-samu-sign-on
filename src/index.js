const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const { cookieSecret, domain } = require('./config');
const { request } = require('./services/confirm-mail');

const {
  Token, Code, User, sequelize,
} = require('./models');

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
      res.redirect(`${req.query.redirect_uri}?code=${encodeURIComponent(code.id)}`);
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

function logout(req, res, next) {
  res.clearCookie('user');
  return next();
}

app.get('/', attachSessionUser, redirectUser, (req, res) => {
  res.render('index');
});

app.post('/', validateUser, storeUserInSession, redirectUser);

app.get('/users', attachSessionUser, (req, res) => {
  User.findAll().then((users) => {
    let message = '';
    if (!req.user.ValidatorId) {
      message = 'Votre compte est en attente de validation par un administrateur.';
    }
    if (!req.user.emailConfirmationTokenAt) {
      message = 'Un email vous a été envoyé. Merci de consulter votre boîte de réception pour confirmer votre adresse mail.';
    }
    res.render('users/list', {
      users,
      loggedInUser: req.user,
      message,
    });
  });
});

app.post('/logout', logout, (req, res) => {
  res.redirect('/');
});

app.get('/users/new', (req, res) => {
  if (Object.keys(req.body).length === 0) {
    req.body = {
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      unit: '',
      department: '',
    };
  }
  res.render('users/new', {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
    unit: req.body.unit,
    department: req.body.department,
  });
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
    res.render('users/new', { error: e, ...req.body });
  });
}, storeUserInSession, (req, res) => {
  Token.create({ userId: req.user.id }).then(token => `${domain}/confirm_mail/?token=${encodeURIComponent(token.id)}`)
    .then((link) => {
      const mailjetRequest = request(req.user, link);
      mailjetRequest
        .then(() => {
          res.redirect('/users');
        })
        .catch((err) => {
          res.render('users/new', {
            error: `Une erreur s'est produite lors de la confirmation de votre compte. (Code : ${err.statusCode})`,
            ...req.body,
          });
        });
    });
});

app.get('/confirm_mail/', (req, res) => {
  Token.findOne({
    where: {
      id: Buffer.from(req.query.token, 'base64'),
    },
  }).then((token) => {
    if (!token) {
      return res.status(404).send({ error: 'Token inconnu' });
    }

    const currentDate = new Date().toISOString();
    const validDate = `${currentDate.replace('T', ' ').replace('Z', '')} +00:00`;
    User.update({
      emailConfirmationTokenAt: new Date(validDate),
    }, {
      where: {
        id: token.userId,
      },
    }).then(() => res.redirect('/users'));
  });
});

app.post('/users/validate/:id', attachSessionUser, (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({ error: 'Vous devez être connecté.' });
  }

  if (!req.user.isValidator) {
    return res.status(401).send({ error: 'Vous devez être validateur.' });
  }

  return next();
}, (req, res) => {
  User.findOne({
    where: {
      id: req.params.id,
    },
  }).then((user) => {
    user.update({
      ValidatorId: req.user.id,
      isValidator: Boolean(req.body.isValidator),
    }).catch(error => res.json(error))
      .then(() => res.redirect('/users'));
  });
});

function getToken(req, res, next) {
  const header = req.get('Authorization');
  if (!header) {
    return res.json({ error: 'Entête d’authentification manquant' });
  }

  if (!header.startsWith('Bearer ')) {
    return res.json({ error: 'Entête d’authentification invalide' });
  }

  req.token = header.slice('Bearer '.length);
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
