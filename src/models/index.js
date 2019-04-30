const Sequelize = require('sequelize');
const { database } = require('../config');

const sequelize = new Sequelize(database);

const codeModel = require('./code');
const userModel = require('./user');

const Code = codeModel(sequelize);
const User = userModel(sequelize);
const db = {
  sequelize,
  Code,
  User,
};

const models = [
  codeModel,
  userModel,
];

models.forEach((m) => {
  if (m.addAssociations) {
    m.addAssociations(db);
  }
});

module.exports = db;
