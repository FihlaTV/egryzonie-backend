const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const endpoints = require('express-list-endpoints');

// Logger
const logger = require(path.join(__dirname, 'src/core/logger'));

logger.info(`Current environment: ${process.env.NODE_ENV}`);

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

if (process.env.NODE_ENV === 'test') {
  const date = new Date();
  const datetime = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}-${('0'+date.getHours()).slice(-2)}${date.getMinutes()}${date.getSeconds()}`;

  app.use(morgan('common', {
    stream: fs.createWriteStream(path.resolve(`test/logs/tests-${datetime}.log`), { flags: 'a' })
  }));
}

// Mongoose models
require(path.resolve('src/modules/profile/profile.model'));
require(path.resolve('src/modules/user/user.model'));
require(path.resolve('src/modules/vets/vet.model'));

// Passport initialization
require(path.resolve('src/core/passport'));
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use(require(path.resolve('src/core/routing')));

// Errors Middleware
require(path.resolve('src/core/middlewares/error-handling'))(app);

// Server variables
const host = process.env.HOST;
const port = process.env.PORT || process.env.FALLBACK_PORT;
const protocol = process.env.USE_SSL === true ? 'https' : 'http';

module.exports = new Promise(async (resolve, reject) => {
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
    throw error;
  }
});