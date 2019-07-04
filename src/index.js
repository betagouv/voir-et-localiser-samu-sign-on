const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

const mailjetModule = require('node-mailjet');

const { cookieSecret, mailjet: { publicKey, privateKey }, domain } = require('./config');

const mailjet = mailjetModule.connect(publicKey, privateKey);

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
  User.findAll().then(users => res.render('users/list', { users, loggedInUser: req.user }));
});

app.post('/logout', logout, (req, res) => {
  res.redirect('/');
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
  Token.create({ userId: req.user.id }).then(token => `${domain}/confirm_mail/?token=${encodeURIComponent(token.id)}`)
    .then((link) => {
      const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: 'contact@voir-et-localiser.beta.gouv.fr',
                Name: 'Voir et localiser',
              },
              To: [
                {
                  Email: req.user.email,
                  Name: `${req.user.firstName} ${req.user.lastName}`,
                },
              ],
              Variables: {
                mjLink: `${link}`,
              },
              Subject: 'Voir et localiser - Confirmer votre email',
              TemplateLanguage: true,
              TextPart: "Bonjour, bienvenue sur la brique d'authentification Voir et localiser ! Vous pouvez, dès à présent, cliquer sur le lien ci-dessus pour vous connecter !",
              HTMLPart: "<h3>Bonjour, <br>bienvenue sur la brique d'authentification "
                + "<a id='confirm-mail-link' href='{{var:mjLink}}'>Voir et localiser</a>.</h3><br>Vous pouvez, dès à présent, cliquer sur le lien ci-dessus pour vous connecter !",
            },
          ],
        });
      request
        .then(() => {
          res.render('index', {
            message: 'Un email vous a été envoyé. Merci de consulter votre boîte de réception pour confirmer votre adresse mail.',
          });
        })
        .catch((err) => {
          res.render('index', {
            message: `Une erreur s'est produite lors de la création de votre compte. (Code : ${err.statusCode}`,
          });
        });
    });
});

app.get('/users/update/:id', (req, res) => {
  res.render('users/update', { user: { id: req.params.id } });
});

app.post('/users/update/:id', attachSessionUser, (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({ error: 'Vous devez être connecté.' });
  }

  return next();
}, (req, res) => {
  if (req.body.password !== req.body.passwordConfirmation) {
    return res.render('users/update', { user: req.user, error: 'Vous devez saisir un mot de passe identique pour la confirmation.' });
  }

  User.update({
    password: req.body.password,
  }, {
    where: {
      id: req.params.id,
    },
  }).then(() => res.redirect('/users'));
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
