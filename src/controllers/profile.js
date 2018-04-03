const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');
const Profile = mongoose.model('profiles');
const { ValidationError, NotFoundError } = require('../helpers/errors');

exports.MyProfile = async (req, res, next) => {
  const profile = await Profile
    .findOne({ UserId: req.user._id })
    .catch(err => next(new Error(`Could not retrieve user profile data. ${err.message}`)));
  if (!profile) {
    const createdProfile = await new Profile({ UserId: req.user._id });
    createdProfile
      .save()
      .catch(err => next(new Error(`Could not save new profile data. ${err.message}`)));
    return res
      .status(201)
      .set('Location', '/profile/' + createdProfile._id)
      .json(createdProfile);
  }
  return res.status(200).json(profile);
};

exports.UpdateProfile = async (req, res, next) => {
  const { FullName, PublicEmail, FacebookURL, TwitterURL, InstagramURL, YouTubeURL } = req.body;
  const IsOrganization = req.body.IsOrganization === 'on' ? true : false;
  const profile = await Profile
    .findOneAndUpdate(
      { UserId: req.user._id },
      { FullName, PublicEmail, FacebookURL, TwitterURL, InstagramURL, YouTubeURL, IsOrganization },
      { upsert: true, new: true, runValidators: true }
    )
    .catch(err => next(new ValidationError(`Could not update user profile data. ${err.message}`)));
  return res.status(200).json(profile);
};

exports.UserProfile = async (req, res, next) => {
  const { UserId } = req.params;
  const profile = await Profile
    .findOne({ UserId })
    .catch(err => new Error(`Could not retrieve user profile data. ${err.message}`));
  if (!profile) {
    return next(new NotFoundError('There is no such user.'));
  }
  return res
    .status(200)
    .json(profile);
};
