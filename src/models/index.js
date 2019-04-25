const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../database.sqlite',
});

const User = require('./user')(sequelize);

sequelize.sync();
module.exports = {
  sequelize,
  User,
};
