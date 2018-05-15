const router = require('express').Router();
const passport = require('passport');
const policy = require('../policies/vets');
const controller = require('../controllers/vets');
const { jwtSession } = require('../../config/secrets');

router.get('/find/:range?/:lat?/:lng?', policy.findInRange, controller.findInRange);

router.get('/test', (req, res, next) => res.json({ message: 'works!' }));

router.get('/test/:index', (req, res, next) => {
  res.json({ message: 'ok' });
});

module.exports = router;