const home = require('./routes/home');
const auth = require('./routes/auth');

module.exports = (app) => {
  app.use('/', home);
  app.use('/auth', auth);
};
