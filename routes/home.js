const router = require('express').Router();
const { wrapAsync } = require('../helpers/async');

router.get('/', (req, res) => {
  res.send('Welcome to eGryzonie API. You probably should not be here.');
});

module.exports = router;