const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  FullName: {
    type: String
  },
  PublicEmail: {
    type: String,
    validate: {
      validator: (value) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ig.test(value),
      message: 'invalid public e-mail'
    }
  },
  FacebookURL: {
    type: String,
    validate: {
      validator: (value) => /^(http:\/\/|https:\/\/)?(www.)?(facebook.com\/)((@)?[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF0-9A-Za-z._-]{1,}\/?)$/ig.test(value),
      message: 'invalid facebook profile url'
    }
  },
  TwitterURL: {
    type: String,
    validate: {
      validator: (value) => /^(http:\/\/|https:\/\/)?(www.)?(twitter.com\/)((@)?[0-9A-Za-z._-]{1,})$/ig.test(value),
      message: 'invalid twitter profile url'
    }
  },
  InstagramURL: {
    type: String,
    validate: {
      validator: (value) => /^(http:\/\/|https:\/\/)?(www.)?(instagram.com\/)((@)?[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF0-9A-Za-z._-]{1,}\/?)$/ig.test(value),
      message: 'invalid instagram profile url'
    }
  },
  YouTubeURL: {
    type: String,
    validate: {
      validator: (value) => /^((http|https):\/\/|)(www\.|)youtube\.com\/(channel\/|user\/)[0-9A-Za-z._-]{1,}$/ig.test(value),
      message: 'invalid youtube channel url'
    }
  },
  IsOrganization: {
    type: Boolean,
    default: false
  }
});

mongoose.model('profiles', UserSchema);