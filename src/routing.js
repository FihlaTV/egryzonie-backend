const router = require('express').Router();
const home = require('./routes/home');
const auth = require('./routes/auth');
const profile = require('./routes/profile');
const vets = require('./routes/vets');

router.use('/', home);
router.use('/auth', auth);
router.use('/profile', profile);
router.use('/vets', vets);

module.exports = router;