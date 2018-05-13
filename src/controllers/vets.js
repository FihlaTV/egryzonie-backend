const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');
const Vet = mongoose.model('vets');
const { ValidationError, NotFoundError } = require('../helpers/errors');

exports.findInRange = async (req, res, next) => {
  const { range, lat, lng } = req.params;

  const vets = await Vet
    .findWithinRange(range, lat, lng)
    .catch(err => {
      console.log(err);
      next(new MongoError(err));
    });

  if (!vets) return res.sendStatus(404);
  
  return res.status(200).json(vets);
};
