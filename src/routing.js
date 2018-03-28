const router = require('express').Router();
const home = require('./routes/home');
const auth = require('./routes/auth');
const profile = require('./routes/profile');

router.use('/', home);
router.use('/auth', auth);
router.use('/profile', profile);

module.exports = router;