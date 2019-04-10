const bodyParser = require('body-parser');
const express = require('express');
const { mustache } = require('consolidate');

const Sequelize = require('sequelize');
const db = require('./models').db;
const User = require('./models/user');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 10101;

app.engine('html', mustache);
app.set('view engine', 'html');

app.get('/', (req, res) => {
  return res.render('index');
  res.render('index');
});

app.get('/user/create', (req, res) => {

  res.send(`/user/create : ${Object.keys(req)}`);
  //res.send(`/user/create : Bonjour ${newUser.newEmail}`);
});

app.post('/user/create', (req, res) => {
  const newUser = req.body;
  createUser(newUser).then(u => res.json(u.toJSON()))
      .catch(e => res.json({error: e }));
});

function createUser(user) {
  db.Users.create({
    email: 'mail_1@mail.com',
    password: '0000',
    lastName: 'Gicquel',
    firstName: 'Benjamin',
    role: 'ROLE_ADMIN_N',
    unit: 'SAMU',
    department: 85,
    validatorId: 1
  })
}

function validateUser(req, res, next) {
  User.findOne({ where: { email: req.body.username }})
  .then(user => {
    if (! user) {
      return res.render('index', { error: 'Email inconnu' });
    }

    next();
  })

}

app.post('/', validateUser, (req, res) => {
  res.json(req.body);
});

app.listen(port, () => {
  console.log('Server listening on port %d', port);
});
