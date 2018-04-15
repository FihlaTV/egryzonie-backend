const router = require('express').Router();
const passport = require('passport');
const controller = require('../controllers/vets');
const { jwtSession } = require('../../config/secrets');



module.exports = router;