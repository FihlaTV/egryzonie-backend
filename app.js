const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Errors Middleware
require('./middlewares/error-handling')(app);

app.get('/', (req, res) => {
  throw new Error('Przyduś kaczora');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable */
  console.log(`Server listening on port ${port}...`);
});
