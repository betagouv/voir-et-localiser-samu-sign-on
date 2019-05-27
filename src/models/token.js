const Sequelize = require('sequelize');
const { randomBytes } = require('../crypto');

const schema = {
  id: {
    primaryKey: true,
    type: Sequelize.CHAR(40),
    allowNull: false,
    unique: true,
    get() {
      return this.getDataValue('id').toString('base64');
    },
  },
};

function createModel(sequelize) {
  return sequelize.define('email_token', schema, {
    updatedAt: false,
    hooks: {
      // defaultValue do not accept async function
      // This is a workaround.
      // cf. https://github.com/sequelize/sequelize/issues/4569
      beforeValidate: (token) => {
        if (token.getDataValue('id')) {
          return;
        }

        return randomBytes(40).then((bytes) => {
          token.setDataValue('id', bytes);
        });
      },
    },
  });
}

function addAssociations(db) {
  db.Token.belongsTo(db.User, { onDelete: 'cascade', foreignKey: { allowNull: false } });
}

createModel.addAssociations = addAssociations;

module.exports = createModel;
