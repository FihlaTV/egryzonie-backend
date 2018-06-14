const logger = require('../logger');
const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');
const Vet = mongoose.model('vets');
const { ValidationError, NotFoundError } = require('../helpers/errors.helper');



/**
 * GET /find_one/:id
 * Find single Vet place
 */
exports.findById = async (req, res, next) => {
  const { id } = req.params;

  const vet = await Vet
    .findById(id)
    .catch(err => {
      logger.error(err);
      next(new MongoError(err));
    });

  if (!vet) {
    return res.sendStatus(404);
  }
  return res.status(200).json(vet);
};



/**
 * Creates a search and finds Vets by range and coordinates
 * POST /find_nearby
 */
exports.findInRange = async (req, res, next) => {
  const { range, lat, lng } = req.body;

  const vets = await Vet
    .findWithinRange(range, lat, lng)
    .catch(err => {
      logger.error(err);
      next(new MongoError(err));
    });

  return res.status(201).json(vets);
};



/**
 * Find name or address
 */
exports.findByNameOrAddress = async (req, res, next) => {
  const { search } = req.body;

  const vets = await Vet
    .findByNameOrAddress(search)
    .catch(err => {
      logger.error(err);
      next(new MongoError(err));
    });

  return res.status(201).json(vets);
};