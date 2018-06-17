const path = require('path');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const secrets = require(path.resolve('config/secrets'));

const mongoose = require('mongoose');
require(path.resolve('src/modules/user/user.model'));
const User = mongoose.model('users');

const host = process.env.HOST;
const port = process.env.PORT || process.env.FALLBACK_PORT;
const protocol = process.env.USE_SSL === true ? 'https' : 'http';

// OAuth2 profile callback
function FacebookCallback(accessToken, refreshToken, profile, done) {
  User.findOne({ FacebookID: profile.id })
    .then((foundUser) => {
      // Check if User exists
      if (!foundUser) {
        const createdUser = new User({
          FacebookID: profile.id,
          Nickname: profile.displayName,
          Email: profile.emails[0].value,
          AvatarURL: profile.photos[0].value
        });
        createdUser.save()
          .then((user) => {
            done(null, user);
          })
          .catch((error) => {
            console.error(`Error while registering user via Facebook: ${error.message}`);
            done(null, false, { message: `Error while registering user via Facebook: ${error.message}` });
          });
      } else {
        done(null, foundUser);
      }
    })
    .catch((error) => {
      console.error(`Error authenticating through Facebook: ${error.message}`);
      done(null, false, { message: `Error authenticating through Facebook: ${error.message}` });
    });
}

function GoogleCallback(accessToken, refreshToken, profile, done) {
  User.findOne({ GoogleID: profile.id })
    .then((foundUser) => {
      // Check if User exists
      if (!foundUser) {
        const createdUser = new User({
          GoogleID: profile.id,
          Nickname: profile.displayName,
          Email: profile.emails[0].value,
          AvatarURL: profile._json.picture
        });
        createdUser.save()
          .then((user) => {
            done(null, user);
          })
          .catch((error) => {
            console.error(`Error while registering user via Google: ${error.message}`);
            done(null, false, { message: `Error while registering user via Google: ${error.message}` });
          });
      } else {
        done(null, foundUser);
      }
    })
    .catch((error) => {
      console.error(`Error authenticating through Google: ${error.message}`);
      done(null, false, { message: `Error authenticating through Google: ${error.message}` });
    });
}

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
passport.use('local-signup', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
  },
  async (req, email, password, done) => {
    // check for duplicates
    const user = await User
      .findOne({ email })
      .catch((err) => done(null, false, { message: err.message }));
    if (user) {
      return done(null, false, { message: 'user duplicate' });
    }

    // create and return
    const newUser = await User
      .create({
        Nickname: req.body.nickname,
        Email: email,
        Password: password
      })
      .catch((err) => done(null, false, { message: err.message }));
    if (!newUser) {
      return done(null, false, { message: 'create user error' });
    }

    return done(null, newUser);
  }
));

passport.use('local-signin', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  async (email, password, done) => {
    const user = await User
      .findOne({ Email: email })
      .catch(err => done(null, false, { message: err.message }));
    
    // No user found
    if (!user) {
      return done(null, false, { message: 'invalid login' });
    }
    
    const compare = await user
      .validatePassword(password)
      .catch(err => done(null, false, { message: err.message }));
    
      // Password invalid
    if (!compare) {
      return done(null, false, { message: 'invalid login' });
    }
    return done(null, user);
  }
));

// Facebook Token Strategy
const FacebookTokenStrategy = require('passport-facebook-token');
passport.use(new FacebookTokenStrategy({
  clientID: secrets.facebookAppId,
  clientSecret: secrets.facebookSecret
}, FacebookCallback));

// Google Token Strategy
const GoogleTokenStrategy = require('passport-google-token').Strategy;
passport.use(new GoogleTokenStrategy({
  clientID: secrets.googleClientID,
  clientSecret: secrets.googleSecret
}, GoogleCallback));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.initialize();
