const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Routing
require('./routing')(app);

// Errors Middleware
require('./middlewares/error-handling')(app);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable */
  console.log(`Server listening on port ${port}...`);
});
