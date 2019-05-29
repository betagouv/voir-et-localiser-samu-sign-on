const Sequelize = require('sequelize');
const { database } = require('../config');

const sequelize = new Sequelize(database);

const tokenModel = require('./token');
const codeModel = require('./code');
const userModel = require('./user');

const Token = tokenModel(sequelize);
const Code = codeModel(sequelize);
const User = userModel(sequelize);
const db = {
  sequelize,
  Token,
  Code,
  User,
};

const models = [
  tokenModel,
  codeModel,
  userModel,
];

models.forEach((m) => {
  if (m.addAssociations) {
    m.addAssociations(db);
  }
});

module.exports = db;
