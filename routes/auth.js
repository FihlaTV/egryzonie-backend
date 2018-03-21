const passport = require('passport');
const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');
const AuthController = require('../controllers/auth');
const { jwtSession } = require('../config/secrets');

router.get('/me', AuthController.Me);
router.get('/facebook', passport.authenticate('facebook-token'), AuthController.FacebookToken);
router.get('/jwt', passport.authenticate('jwt', jwtSession), AuthController.VerifyToken);

module.exports = router;