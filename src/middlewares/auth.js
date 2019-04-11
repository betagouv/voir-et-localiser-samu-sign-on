const crypto = require('../crypto');
const { User } = require('../models');

function validateUser(req, res, next) {
  User.findOne({ where: { email: req.body.username } })
    .then((user) => {
      if (!user) {
        return res.render('index', { error: 'Email inconnu' });
      }

      return crypto.pbkdf2(req.body.password, (err, derivedKey) => {
        if (err) {
          return res.render('index', { error: 'Mot de passe incalculable' });
        }

        if (derivedKey.compare(user.password) !== 0) {
          return res.render('index', { error: 'Mot de passe incorrect' });
        }

        req.user = user;
        return next();
      });
    });
}

module.exports = {
  validateUser,
};
