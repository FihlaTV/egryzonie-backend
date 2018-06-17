const path = require('path');
const router = require('express').Router();
const { wrapAsync } = require(path.resolve('src/core/helpers/async.helper'));
const controller = require('./home.controller');

router.get('/', controller.HomePage);

module.exports = router;