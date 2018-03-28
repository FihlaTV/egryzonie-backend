const passport = require('passport');
const passportJWT = require('passport-jwt');
const secrets = require('../config/secrets');

const mongoose = require('mongoose');
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
  (req, email, password, done) => {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          return done(null, false, { message: 'user duplicate' });
        }
        const newUser = new User({
          Nickname: req.body.nickname,
          Email: email,
          Password: password
        });
        newUser.save()
          .then((user) => {
            return done(null, user);
          })
          .catch((error) => {
            console.error('Local Signup error: ', error.message);
            return done(null, false, { message: 'create user error' });
          });
      })
      .catch((error) => {
        console.error('Local Signup error: ', error.message);
        return done(null, false, { message: 'create user error' });
      });
  }
));

passport.use('local-signin', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  (email, password, done) => {
    User.findOne({ Email: email })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: 'invalid login' });
        }
        user.validatePassword(password)
          .then((compare) => {
            if (!compare) {
              return done(null, false, { message: 'invalid login' });
            }
            return done(null, user);
          })
          .catch((error) => {
            return done(null, false, { message: 'invalid login' });
          });
      })
      .catch((error) => {
        return done(null, false, { message: 'invalid login' });
      });
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
