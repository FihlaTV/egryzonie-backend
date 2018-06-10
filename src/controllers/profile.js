const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');
const Profile = mongoose.model('profiles');
const { ValidationError, NotFoundError } = require('../helpers/errors');

function createEmptyProfile(UserId) {
  return new Profile({ UserId });
}

exports.MyProfile = (req, res, next) => {
  Profile
    .findOne({ UserId: req.user._id })
    .then(profile => {
      if (!profile) {
        const newProfile = createEmptyProfile(req.user._id);
        return newProfile.save();
      }
      return Promise.resolve(profile);
    })
    .then(profile => {
      return res.status(200)
        .json(profile);
    })
    .catch(err => next(err));
};

exports.UpdateProfile = (req, res, next) => {
  const { FullName, PublicEmail, FacebookURL, TwitterURL, InstagramURL, YouTubeURL } = req.body;
  const IsOrganization = req.body.IsOrganization === 'on' ? true : false;
  Profile
    .findOneAndUpdate(
      { UserId: req.user._id },
      { FullName, PublicEmail, FacebookURL, TwitterURL, InstagramURL, YouTubeURL, IsOrganization },
      { upsert: true, new: true, runValidators: true }
    )
    .then(profile => res.sendStatus(204))
    .catch(err => next(new ValidationError(`Could not update user profile data. ${err.message}`)));
};

exports.UserProfile = (req, res, next) => {
  const { UserId } = req.params;
  User.findOne({ _id: UserId })
    .then(user => {
      if (!user) return Promise.reject(new NotFoundError('User not found.'));
      return Profile.findOne({ UserId: user._id });
    })
    .then(profile => {
      if (!profile) {
        const newProfile = createEmptyProfile(UserId);
        return newProfile.save();
      }
      return Promise.resolve(profile);
    })
    .then(profile => {
      return res.status(200)
        .json(profile);
    })
    .catch(err => next(err));
};
