const crypto = require('crypto');

const salt = 'salt';
const iterations = 100000;
const keylen = 64;
const digest = 'sha512';

function pbkdf2(password, callback) {
  return crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
}

function pbkdf2Sync(password) {
  return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
}

module.exports = {
  pbkdf2,
  pbkdf2Sync,
};
