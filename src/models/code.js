const Sequelize = require('sequelize');

const schema = {

};

function createModel(sequelize) {
  const Code = sequelize.define('code', schema);
  Code.hasOne(User, { as: 'Validator' });
  return User;
}

module.exports = createModel;
