const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  FacebookID: {
    type: String,
    sparse: true,
  },
  GoogleID: {
    type: String,
    sparse: true
  },
  Nickname: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^([\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEFA-Za-z0-9._\- ]{5,55})$/g.test(value),
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
    type: String
  },
  Role: {
    type: String,
    required: true,
    default: 'user',
    validate: {
      validator: (value) => ['superadmin', 'admin', 'moderator', 'user'].includes(value),
      message: 'invalid role'
    }
  },
  AvatarURL: {
    type: String,
    validate: {
      validator: (value) => /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})\/[\w ./-]+?\.(jpeg|jpg|png)$/gi.test(value),
      message: 'invalid image URL'
    }
  }
});

UserSchema.pre('save', function (next) {
  bcrypt.genSalt(8, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(this.Password, salt, (err, hash) => {
      if (err) throw err;
      this.Password = hash;
      next();
    });
  });
});

UserSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compare(password, this.Password);
};

UserSchema.statics.getLoginData = function getLoginData(UserId) {
  return this.model('users')
    .findOne({ _id: UserId })
    .select('_id Nickname Email Role AvatarURL');
};

mongoose.model('users', UserSchema);