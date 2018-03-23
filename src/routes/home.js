const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');
const HomeController = require('../controllers/home');

router.get('/', HomeController.HomePage);

module.exports = router;