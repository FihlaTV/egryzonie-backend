const path = require('path');
const startServer = require(path.resolve('app'));
const logger = require(path.resolve('src/core/logger'));

startServer
  .then(app => logger.info('App started.'))
  .catch(error => { throw error; });