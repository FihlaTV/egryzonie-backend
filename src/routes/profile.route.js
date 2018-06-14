const router = require('express').Router();
const passport = require('passport');
const { wrapAsync } = require('../helpers/async.helper');
const controller = require('../controllers/profile.controller');
const { jwtSession } = require('../../config/secrets');

router.get('/', passport.authenticate('jwt', jwtSession), controller.MyProfile);
router.put('/', passport.authenticate('jwt', jwtSession), controller.UpdateProfile);
router.get('/:UserId', controller.UserProfile);

module.exports = router;