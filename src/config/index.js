const env = process.env.NODE_ENV || 'development';

const all = {
  env,
  passwordSalt: process.env.PASSWORD_SALT || 'salty',
  cookieSecret: process.env.COOKIE_SECRET || 'honey',
  database: {
    dialect: 'sqlite',
    storage: process.env.DATABASE_SQLITE_FILE || 'database.sqlite',
  },
  domain: process.env.DOMAIN || 'https://id.voir-et-localiser.beta.gouv.fr',
  mailjet: {
    publicKey: process.env.MJ_APIKEY_PUBLIC,
    privateKey: process.env.MJ_APIKEY_PRIVATE,
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
