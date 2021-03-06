const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const { wrapAsync } = require(path.resolve('src/core/helpers/async.helper'));
const { jwtSession } = require(path.resolve('config/secrets'));

const controller = require('./profile.controller');

router.get('/', passport.authenticate('jwt', jwtSession), controller.MyProfile);
router.put('/', passport.authenticate('jwt', jwtSession), controller.UpdateProfile);
router.get('/:UserId', controller.UserProfile);

module.exports = router;