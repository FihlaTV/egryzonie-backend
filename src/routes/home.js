const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');
const controller = require('../controllers/home');

router.get('/', controller.HomePage);

module.exports = router;