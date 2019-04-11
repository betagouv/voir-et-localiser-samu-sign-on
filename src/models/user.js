const Sequelize = require('sequelize');
const crypto = require('../crypto');

const schema = {
  email: {
    type: Sequelize.STRING,
    unique: true,
  },
  password: {
    type: Sequelize.STRING.BINARY,
    set(value) {
      this.setDataValue('password', crypto.pbkdf2Sync(value));
    },
  },
  lastName: Sequelize.STRING,
  firstName: Sequelize.STRING,
  role: Sequelize.STRING,
  unit: Sequelize.STRING,
  departement: Sequelize.STRING,
  hasSuperpower: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
};

function createModel(sequelize) {
  const User = sequelize.define('user', schema);
  User.hasOne(User, { as: 'Validator' });
  return User;
}

module.exports = createModel;
