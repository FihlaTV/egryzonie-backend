const mongoose = require('mongoose');
const { MongoError } = require('mongodb');
const User = mongoose.model('users');
const Profile = mongoose.model('profiles');

exports.MyProfile = (req, res, next) => {
  Profile.findOne({ UserId: req.user._id })
    .then((profile) => {
      if (!profile) {
        new Profile({ UserId: req.user._id })
          .save()
          .then((createdProfile) => {
            return res.status(201).json(createdProfile);
          });
      }
      return res.status(200).json(profile);
    })
    .catch((error) => next(new Error(`Could not retrieve user profile data. ${error.message}`)));
};

exports.UpdateProfile = (req, res, next) => {
  const { FullName, PublicEmail, FacebookURL, TwitterURL, InstagramURL, YouTubeURL } = req.body;
  const IsOrganization = req.body.IsOrganization === 'on' ? true : false;
  Profile.findOneAndUpdate(
    { UserId: req.user._id },
    { FullName, PublicEmail, FacebookURL, TwitterURL, InstagramURL, YouTubeURL, IsOrganization },
    { upsert: true }
  )
    .then((profile) => {
      return res.status(200).json(profile);
    })
    .catch((error) => next(new Error(`Could not update user profile data. ${error.message}`)));
};

exports.UserProfile = (req, res, next) => {
  const { UserId } = req.params;
  Profile.findOne({ UserId })
    .then((profile) => {
      if (!profile) {
        const emptyProfile = new Profile({ UserId });
        return res.status(200).json(emptyProfile);
      }
      return res.status(200).json(profile);
    })
    .catch((error) => next(new Error(`Could not retrieve user profile data. ${error.message}`)));
};
