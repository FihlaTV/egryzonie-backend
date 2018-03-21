const passport = require('passport');
const passportJWT = require('passport-jwt');
const secrets = require('./config/secrets');

const mongoose = require('mongoose');
const User = mongoose.model('users');

const host = process.env.HOST;
const port = process.env.PORT || process.env.FALLBACK_PORT;
const protocol = process.env.USE_SSL === true ? 'https' : 'http';

// Token Authentication
const { Strategy, ExtractJwt } = passportJWT;
passport.use(new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secrets.jwtSecret
},
(jwtPayload, done) => {
  return User.findById(jwtPayload.id)
    .then((user) => done(null, user))
    .catch((error) => done(error));
}));

// Local Strategy
const LocalStrategy = require('passport-local');
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'invalid login' });
    }
    const validatePassword = await user.validatePassword(password);
    if (!validatePassword) {
      return done(null, false, { message: 'invalid login' });
    }
  } catch (error) {
    return done(null, false, { message: 'invalid login', error: error.message });
  }
}));

// Facebook Strategy
const FacebookTokenStrategy = require('passport-facebook-token');
passport.use(new FacebookTokenStrategy({
  clientID: secrets.facebookAppId,
  clientSecret: secrets.facebookSecret
}, async (accessToken, refreshToken, profile, done) => {
  User.findOne({ FacebookID: profile.id })
    .then((foundUser) => {
      if (!foundUser) {
        const createdUser = new User({
          FacebookID: profile.id,
          Nickname: profile.displayName,
          Email: profile.emails[0].value,
          AvatarURL: profile.photos[0].value
        });
        createdUser.save()
          .then((user) => done(null, createdUser))
          .catch((error) => done(null, false, {
            message: `Error checking for existing user: ${error.message}`
          }));
        return;
      }
      return done(null, foundUser);
    })
    .catch((error) => done(null, false, {
      message: `Error checking for existing user: ${error.message}`
    }));
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.initialize();
