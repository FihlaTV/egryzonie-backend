const path = require('path');
const jwt = require('jsonwebtoken');
const secrets = require(path.resolve('config/secrets'));

module.exports = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, secrets.jwtSecret, {
    expiresIn: '7d',
    issuer: secrets.jwtIssuer
  });
};