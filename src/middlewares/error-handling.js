const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');
const { ValidationError, NotFoundError } = require('../helpers/errors');

module.exports = (app) => {
  app.use(function handleAssertionError(error, req, res, next) {
    if (error instanceof AssertionError) {
      return res.status(400).json({
        type: 'AssertionError',
        message: error.message
      });
    }
    return next(error);
  });

  app.use(function handleDatabaseError(error, req, res, next) {
    if (error instanceof MongoError) {
      return res.status(503).json({
        type: 'MongoError',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        type: 'Validation Error',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        type: 'NotFound Error',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    return res.status(500).json({
      type: 'General Error',
      message: error.message
    });
  });
};
