const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const { jwtSession } = require(path.resolve('config/secrets'));
const policy = require('./vets.policy');
const controller = require('./vets.controller');

/**
 * GET /find_one/:id
 */
router.get(
  '/find_one/:id?',
  policy.findById,
  controller.findById
);

/**
 * GET /:slug/view
 */
router.get(
  '/:slug/view',
  policy.findBySlug,
  controller.findBySlug
);

/**
 * POST /find_nearby
 */
router.post(
  '/find_nearby',
  policy.findInRange,
  controller.findInRange
);

/**
 * POST /search
 * @param search String Text to search with.
 */
router.post(
  '/search',
  policy.findByNameOrAddress,
  controller.findByNameOrAddress
);

module.exports = router;