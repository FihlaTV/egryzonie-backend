const logger = require('../logger');
const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');
const Vet = mongoose.model('vets');
const { ValidationError, NotFoundError } = require('../helpers/errors');

/**
 * Find by range and coordinates
 */
exports.findInRange = async (req, res, next) => {
  const { range, lat, lng } = req.params;

  const vets = await Vet
    .findWithinRange(range, lat, lng)
    .catch(err => {
      logger.error(err);
      next(new MongoError(err));
    });

  if (!vets.length) return res.sendStatus(204);

  return res.status(200).json(vets);
};

/**
 * Find name or address
 */
exports.createSearch = async (req, res, next) => {
  const { search } = req.body;

  const vets = await Vet
    .findByNameOrAddress(search)
    .catch(err => {
      logger.error(err);
      next(new MongoError(err));
    });

  if (!vets) return res.sendStatus(404);

  return res.status(200).json(vets);
};
