const bcrypt = require('bcrypt-as-promised');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  FacebookID: {
    type: String,
    unique: true
  },
  GoogleID: {
    type: String,
    unique: true
  },
  Nickname: {
    type: String,
    required: true,
    unique: true,
    min: [5, 'nickname too short'],
    validate: {
      validator: (value) => /^([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-Za-z. -]{0,55})$/.test(value),
      message: 'invalid nickname'
    }
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value),
      message: 'invalid e-mail'
    }
  },
  Password: {
    type: String,
    min: [5, 'password too short']
  },
  Role: {
    type: String,
    required: true,
    default: 'user'
  },
  AvatarURL: {
    type: String
  }
});

UserSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compare(password, this.password);
};

mongoose.model('users', UserSchema);