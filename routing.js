const home = require('./routes/home');

module.exports = (app) => {
  app.use('/', home);
};
