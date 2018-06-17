const path = require('path');
const mongoose = require('mongoose');
const { NotFoundError } = require(path.resolve('src/core/helpers/errors.helper'));
const createToken = require(path.resolve('src/core/util/jwt'));

const User = mongoose.model('users');

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
