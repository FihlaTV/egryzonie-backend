const path = require('path');
const router = require('express').Router();
const home = require(path.resolve('src/modules/home/home.route'));
const auth = require(path.resolve('src/modules/auth/auth.route'));
const profile = require(path.resolve('src/modules/profile/profile.route'));
const vets = require(path.resolve('src/modules/vets/vets.route'));

router.use('/', home);
router.use('/auth', auth);
router.use('/profile', profile);
router.use('/vets', vets);

module.exports = router;