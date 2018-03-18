const passport = require('passport');
const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');
const AuthController = require('../controllers/auth');

const facebookMiddleware = (req, res, next) => {
  console.log('Facebook middleware');
  next();
};

router.get('/facebook', facebookMiddleware, passport.authenticate('facebook', { authType: 'rerequest', scope: ['email'] }));
router.get('/facebook/callback', facebookMiddleware, passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/?error'
}));
router.get('/me', AuthController.Me);

module.exports = router;