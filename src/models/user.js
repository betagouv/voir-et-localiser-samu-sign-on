const Sequelize = require('sequelize');
const crypto = require('../crypto');

const schema = {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING.BINARY,
    allowNull: false,
    set(value) {
      this.setDataValue('password', crypto.pbkdf2Sync(value));
    },
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: Sequelize.STRING,
  unit: Sequelize.STRING,
  departement: Sequelize.STRING,
  isValidator: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
};

function createModel(sequelize) {
  const User = sequelize.define('user', schema);
  User.hasOne(User, { as: 'Validator' });
  return User;
}

module.exports = createModel;
