const router = require('express').Router();
const { wrapAsync } = require('../helpers/async.helper');
const controller = require('../controllers/home.controller');

router.get('/', controller.HomePage);

module.exports = router;