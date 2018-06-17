const bcrypt = require('bcrypt');

exports.hash = (text) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(8, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(text, salt, (err, hash) => {
        if (err) throw err;
        resolve(hash);
      });
    });
  });
};

exports.compare = bcrypt.compare;
