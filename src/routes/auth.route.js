const passport = require('passport');
const router = require('express').Router();
const { wrapAsync } = require('../helpers/async.helper');
const controller = require('../controllers/auth.controller');
const { jwtSession } = require('../../config/secrets');

router.post(
  '/signup',
  passport.authenticate('local-signup'),
  controller.CreateToken
);

router.post(
  '/signin',
  passport.authenticate('local-signin'),
  controller.CreateToken
);

router.get(
  '/facebook',
  passport.authenticate('facebook-token'),
  controller.CreateToken
);

router.get(
  '/google',
  passport.authenticate('google-token'),
  controller.CreateToken
);

router.get(
  '/jwt',
  passport.authenticate('jwt', jwtSession),
  controller.VerifyToken
);

module.exports = router;