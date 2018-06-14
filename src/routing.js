const router = require('express').Router();
const home = require('./routes/home.route');
const auth = require('./routes/auth.route');
const profile = require('./routes/profile.route');
const vets = require('./routes/vets.route');

router.use('/', home);
router.use('/auth', auth);
router.use('/profile', profile);
router.use('/vets', vets);

module.exports = router;