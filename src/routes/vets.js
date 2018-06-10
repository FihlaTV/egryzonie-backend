const router = require('express').Router();
const passport = require('passport');
const policy = require('../policies/vets');
const controller = require('../controllers/vets');
const { jwtSession } = require('../../config/secrets');


/**
 * GET /find_one/:id
 */
router.get(
  '/find_one/:id?',
  policy.findById,
  controller.findById
);


/**
 * GET /find_nearby/:range/:lat/:lng
 * @param range (Integer) Range from center.
 * @param lat (Float) Longitude of origin.
 * @param lng (Float) Longitude of origin.
 */
router.get(
  '/find_nearby/:range?/:lat?/:lng?',
  policy.findInRange,
  controller.findInRange
);


/**
 * POST /find_nearby
 * @memberOf
 */
router.post(
  '/find_nearby',
  policy.findInRangePost,
  controller.findInRangePost
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