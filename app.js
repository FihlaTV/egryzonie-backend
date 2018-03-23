const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');

// Dotenv config
dotenv.config({ path: path.join(__dirname, 'config') });
dotenv.load();

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev', {
  skip: (req, res) => {
    return res.statusCode < 400;
  },
  stream: process.stderr
}));

app.use(morgan('dev', {
  skip: (req, res) => {
    return res.statusCode >= 400;
  },
  stream: process.stdout
}));

// Errors Middleware
require('./middlewares/error-handling')(app);

// Mongoose models
require('./models');

// Passport initialization
require('./passport');
app.use(passport.initialize());
app.use(passport.session());

// Routing
require('./routing')(app);

// Server variables
const host = process.env.HOST;
const port = process.env.PORT || process.env.FALLBACK_PORT;
const protocol = process.env.USE_SSL === true ? 'https' : 'http';

// Mongoose connect and server start
mongoose.connect(`mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB}`)
  .then(() => {
    console.log('MongoDB connected.');
    app.listen(port, () => {
      console.log(`API opened on address ${protocol}://${host}:${port}/...`);
    });
  });
