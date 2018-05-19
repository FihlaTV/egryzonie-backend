const router = require('express').Router();
const passport = require('passport');
const policy = require('../policies/vets');
const controller = require('../controllers/vets');
const { jwtSession } = require('../../config/secrets');

router.get('/find_nearby/:range?/:lat?/:lng?', policy.findInRange, controller.findInRange);

router.post('/search', policy.findByNameOrAddress, controller.findByNameOrAddress);

module.exports = router;