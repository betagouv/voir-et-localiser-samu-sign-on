const Sequelize = require('sequelize');

const schema = {
  email: Sequelize.STRING,
  password: Sequelize.STRING,
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
