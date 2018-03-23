const passport = require('passport');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');
const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, secrets.jwtSecret, {
    expiresIn: '7d',
    issuer: secrets.jwtIssuer
  });
}

exports.Me = (req, res, next) => {
  User.findOne({ _id: req.user.id })
    .select('Id Nickname Email Role AvatarURL')
    .then((user) => {
      return res.json({ user });
    })
    .catch((error) => next(new Error('Error during fetching user.', error.message)));
};

exports.CreateToken = (req, res, next) => {
  const jwtToken = createToken(req.user);
  return res.status(201).send({ jwtToken });
};

exports.VerifyToken = (req, res, next) => {
  User.getLoginData(req.user.id)
    .then(user => res.json(user))
    .catch(error => next(new Error('Error during login verification.' + error.message)));
};
