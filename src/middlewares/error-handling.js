const { MongoError } = require('mongodb');
const { BadRequestError, ValidationError, NotFoundError } = require('../helpers/errors');
const logger = require('../logger');

module.exports = (app) => {
  app.use(function handleAssertionError(error, req, res, next) {
    if (error instanceof BadRequestError) {
      logger.error('Assertion Error: ' + error.message);
      return res.status(400).json({
        type: 'AssertionError',
        message: error.message
      });
    }
    return next(error);
  });

  app.use(function handleDatabaseError(error, req, res, next) {
    if (error instanceof MongoError) {
      logger.error('MongoDB Error: ' + error.message);
      return res.status(503).json({
        type: 'MongoError',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    if (error instanceof ValidationError) {
      logger.error('Validation Error: ' + error.message);
      return res.status(400).json({
        type: 'Validation Error',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    if (error instanceof NotFoundError) {
      logger.error('Not Found Error: ' + error.message);
      return res.status(404).json({
        type: 'NotFound Error',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    logger.error('General Error: ' + error.message);
    return res.status(500).json({
      type: 'General Error',
      message: error.message
    });
  });
};
