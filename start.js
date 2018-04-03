const startServer = require('./app');

startServer
  .then(app => console.log('App started.'))
  .catch(error => { throw error; });