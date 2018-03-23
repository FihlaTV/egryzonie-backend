const passport = require('passport');
const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');
const controller = require('../controllers/auth');
const policies = require('../policies/auth');
const { jwtSession } = require('../config/secrets');

router.get(
  '/me',
  controller.Me
);

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