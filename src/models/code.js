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
  return sequelize.define('code', schema, {
    updatedAt: false,
    hooks: {
      // defaultValue do not accept async function
      // This is a workaround.
      // cf. https://github.com/sequelize/sequelize/issues/4569
      beforeValidate: (code) => {
        const id = code.getDataValue('id'); 
        if (id) {
          return id;
        }

        return randomBytes(40).then((bytes) => {
          return code.setDataValue('id', bytes);
        });
      },
    },
  });
}

function addAssociations(db) {
  db.Code.belongsTo(db.User, { onDelete: 'cascade', foreignKey: { allowNull: false } });
}

createModel.addAssociations = addAssociations;

module.exports = createModel;
