const startServer = require('./app');
const logger = require('./src/logger');

startServer
  .then(app => logger.info('App started.'))
  .catch(error => { throw error; });