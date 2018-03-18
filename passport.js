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
const FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
  clientID: secrets.facebookAppId,
  clientSecret: secrets.facebookSecret,
  callbackURL: `${protocol}://${host}:${port}/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'photos', 'email']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const foundUser = await User.findOne({ FacebookID: profile.id });
    if (!foundUser) {
      const newUser = new User({
        FacebookID: profile.id,
        Nickname: profile.displayName,
        Email: profile.emails[0].value,
        AvatarURL: profile.photos[0].value
      });
      await newUser.save();
      return done(null, newUser);
    } else {
      return done(null, foundUser);
    }
  } catch (error) {
    return done(null, false, { message: 'invalid facebook login', error: error.message });
  }
}));

passport.serializeUser((user, done) => {
  console.log('SERIALIZE USER', user);
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((error) => done(error, false));
});