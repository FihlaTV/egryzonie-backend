const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');

console.log(process.env.NODE_ENV);

// Logger
const logger = require('./src/logger');

// Dotenv config
dotenv.config({ path: path.resolve(process.cwd(), 'environment', `.${process.env.NODE_ENV.trim()}.env`) });

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    skip: (req, res) => res.statusCode < 400,
    stream: process.stderr
  }));

  app.use(morgan('dev', {
    skip: (req, res) => res.statusCode >= 400,
    stream: process.stdout
  }));
}

// Mongoose models
require('./src/models');

// Passport initialization
require('./src/passport');
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use(require('./src/routing'));

// Errors Middleware
require('./src/middlewares/error-handling')(app);

// Server variables
const host = process.env.HOST;
const port = process.env.PORT || process.env.FALLBACK_PORT;
const protocol = process.env.USE_SSL === true ? 'https' : 'http';

// Start the server
module.exports = new Promise(async (resolve, reject) => {
  console.log('trying to start server');
  try {
    await mongoose.connect(`mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB}`);
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.db.dropDatabase();
      logger.info('Test database dropped.');
    }
    app.listen(port, () => {
      logger.info(`API server started at ${protocol}://${host}:${port}.`);
      resolve({ app, mongoose });
    });
  } catch (error) {
    console.error(error.message);
    reject();
  }
});