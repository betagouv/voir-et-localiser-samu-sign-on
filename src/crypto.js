const crypto = require('crypto');
const { passwordSalt } = require('./config');

const iterations = 100000;
const keylen = 64;
const digest = 'sha512';

function pbkdf2(password, callback) {
  return crypto.pbkdf2(password, passwordSalt, iterations, keylen, digest, callback);
}

function pbkdf2Sync(password) {
  return crypto.pbkdf2Sync(password, passwordSalt, iterations, keylen, digest);
}

module.exports = {
  pbkdf2,
  pbkdf2Sync,
};
