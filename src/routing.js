const home = require('./routes/home');
const auth = require('./routes/auth');
const profile = require('./routes/profile');

module.exports = (app) => {
  app.use('/', home);
  app.use('/auth', auth);
  app.use('/profile', profile);
};
