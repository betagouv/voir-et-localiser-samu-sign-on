const Sequelize = require('sequelize'), db = {};

const sequelize = new Sequelize(
  'sqlite:/home/romy/WebstormProjects/voir-et-localiser-samu-sign-on/sqlite/db/voir-et-localiser.db'
);

/*
const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  storage: '../../../sqlite/db/voir-et-localiser.db/main.users',
  pool: {
    max: 5,
    idle: 30000,
    acquire: 60000,
  },
  logging: false,
  port: 3306
});
*/
const User = require('./user')(sequelize);

/**
 * Users
 */
db['Users'] = sequelize.define('users',
    {
      email: { type:Sequelize.STRING },
      password: { type:Sequelize.STRING },
      lastName: { type:Sequelize.STRING },
      firstName: { type:Sequelize.STRING },
      role: { type:Sequelize.STRING },
      unit: { type:Sequelize.STRING },
      department: { type:Sequelize.STRING },
      validated_by_user_id: { type:Sequelize.INTEGER },
      hasSuperpower: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {

    }
);

sequelize.sync();
module.exports = {
  sequelize,
  User,
  db
};
