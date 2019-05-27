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
  department: Sequelize.STRING,
  isValidator: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
  emailConfirmationTokenAt: { type: Sequelize.DATE },
};

function createModel(sequelize) {
  return sequelize.define('user', schema, {
    paranoid: true,
  });
}

function addAssociations(db) {
  db.User.hasOne(db.User, { as: 'Validator' });
}

createModel.addAssociations = addAssociations;

module.exports = createModel;
