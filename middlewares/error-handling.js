const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');

module.exports = (app) => {
  app.use(function handleAssertionError(error, req, res, next) {
    if (error instanceof AssertionError) {
      return res.status(400).json({
        type: 'AssertionError',
        message: error.message
      });
    }
    next(error);
  });

  app.use(function handleDatabaseError(error, req, res, next) {
    if (error instanceof MongoError) {
      return res.status(503).json({
        type: 'MongoError',
        message: error.message
      });
    }
    next(error);
  });
};
