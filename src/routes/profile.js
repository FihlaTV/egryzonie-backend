const router = require('express').Router();
const passport = require('passport');
const { wrapAsync } = require('../helpers/async');
const controller = require('../controllers/profile');
const { jwtSession } = require('../../config/secrets');

router.get('/', passport.authenticate('jwt', jwtSession), controller.MyProfile);
router.put('/', passport.authenticate('jwt', jwtSession), controller.UpdateProfile);
router.get('/:UserId', controller.UserProfile);

module.exports = router;