const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const env = process.env.NODE_ENV || 'development';

// Dotenv config
dotenv.config({ path: path.join(__dirname, 'config') });
dotenv.load();

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (env === 'development') {
  app.use(morgan('dev', {
    skip: (req, res) => {
      res.statusCode < 400;
    },
    stream: process.stderr
  }));

  app.use(morgan('dev', {
    skip: (req, res) => {
      res.statusCode >= 400;
    },
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
require('./src/routing')(app);

// Errors Middleware
require('./src/middlewares/error-handling')(app);

// Server variables
const host = process.env.HOST;
const port = process.env.PORT || process.env.FALLBACK_PORT;
const protocol = process.env.USE_SSL === true ? 'https' : 'http';

// Start the server
module.exports = new Promise((resolve, reject) => {
  mongoose.connect(`mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB}`)
    .then(() => {
      console.log('MongoDB connected.');
      app.listen(port, () => {
        console.log(`API server started at ${protocol}://${host}:${port}.`);
        resolve(app);
      });
    });
});