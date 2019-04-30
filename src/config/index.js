const env = process.env.NODE_ENV || 'development';

const all = {
  env,
  passwordSalt: process.env.PASSWORD_SALT || 'salty',
  cookieSecret: process.env.COOKIE_SECRET || 'honey',
  database: {
    dialect: 'sqlite',
    storage: process.env.DATABASE_SQLITE_FILE || 'database.sqlite',
  },
};

try {
  const override = require(`./env/${env}`); // eslint-disable-line
  console.info(`Using specific configuration for ${env}.`); // eslint-disable-line
  module.exports = Object.assign(all, override);
} catch (e) {
  console.warn(`No specific configuration for ${env}.`); // eslint-disable-line
  module.exports = all;
}
