const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');
const profile = require('../policies/profile');
const controller = require('../controllers/profile');

router.get('/', controller.MyProfile);
router.put('/', controller.UpdateProfile);
router.get('/:userId', controller.UserProfile);

module.exports = router;