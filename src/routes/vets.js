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