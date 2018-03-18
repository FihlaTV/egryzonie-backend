const fs = require('fs');
const path = require('path');

fs.readdir(path.join(__dirname), {}, (err, files) => {
  files.forEach((file) => {
    if (/^(?!.*(index)).*js$/i.test(file)) {
      require(path.join(__dirname, file));
    }
  });
});