const { AssertionError } = require('assert');
const { MongoError } = require('mongodb');
const { ValidationError, NotFoundError } = require('../helpers/errors');
const logger = require('../logger');

module.exports = (app) => {
  app.use(function handleAssertionError(error, req, res, next) {
    if (error instanceof AssertionError) {
      logger.info('Assertion Error: ', error.message);
      return res.status(400).json({
        type: 'AssertionError',
        message: error.message
      });
    }
    return next(error);
  });

  app.use(function handleDatabaseError(error, req, res, next) {
    if (error instanceof MongoError) {
      logger.info('MongoDB Error: ', error.message);
      return res.status(503).json({
        type: 'MongoError',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    if (error instanceof ValidationError) {
      logger.info('Validation Error: ', error.message);
      return res.status(400).json({
        type: 'Validation Error',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    if (error instanceof NotFoundError) {
      logger.info('Not Found Error: ', error.message);
      return res.status(404).json({
        type: 'NotFound Error',
        message: error.message
      });
    }
    return next(error);
  });

  app.use((error, req, res, next) => {
    logger.info('General Error: ', error.message);
    return res.status(500).json({
      type: 'General Error',
      message: error.message
    });
  });
};
