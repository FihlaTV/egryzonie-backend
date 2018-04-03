const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const { NotFoundError } = require('../helpers/errors');

const secrets = require('../../config/secrets');
const User = mongoose.model('users');

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, secrets.jwtSecret, {
    expiresIn: '7d',
    issuer: secrets.jwtIssuer
  });
}

exports.Me = (error, req, res, next) => {
  User.findOne({ _id: req.user.id })
    .select('Id Nickname Email Role AvatarURL')
    .then(user => {
      if (!user) return Promise.reject(new NotFoundError('You do not exist.'));
      return res.json({ user });
    })
    .catch(err => next(err));
};

exports.CreateToken = (req, res, next) => {
  if (!req.user) return next(new Error('Could not create token.'));
  const jwtToken = createToken(req.user);
  return res.status(201).send({ jwtToken });
};

exports.VerifyToken = (req, res, next) => {
  User.getLoginData(req.user.id)
    .then(user => {
      if (!user) return Promise.reject(new NotFoundError('User not found.'));
      return res.json(user);
    }) 
    .catch(err => next(err));
};
