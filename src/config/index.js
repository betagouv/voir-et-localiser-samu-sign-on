const env = process.env.NODE_ENV || 'development';

const all = {
  env,
  passwordSalt: process.env.PASSWORD_SALT || 'salty',
  cookieSecret: process.env.COOKIE_SECRET || 'honey',
};

try {
  const override = require(`./env/${env}`); // eslint-disable-line
  console.info(`Using specific configuration for ${env}.`); // eslint-disable-line
  module.exports = Object.assign(all, override);
} catch (e) {
  console.warn(`No specific configuration for ${env}.`); // eslint-disable-line
  module.exports = all;
}
