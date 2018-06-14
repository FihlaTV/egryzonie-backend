const logger = require('../logger');
const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const { Schema } = mongoose;

const GeoSchema = require('./geoschema.model');
const User = require('./user.model');



/***** SCHEMA DEFINITION ******/

const VetSchema = new Schema({
  GoogleMapsID: {
    type: String,
    required: [true, 'google maps id is missing'],
    unique: [true, 'google maps id must be unique'],
    validate: {
      validator: (value) => /^[A-Za-z0-9_]{27,30}$/g.test(value),
      message: 'invalid google maps id'
    }
  },
  Position: {
    type: GeoSchema,
    validate: {
      validator: (value) => {
        if (!Array.isArray(value)) return false;
        const [lng, lat] = value;
        return (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90);
      },
      message: 'invalid coordinates'
    }
  },
  Name: {
    type: String,
    required: true
  },
  Address: {
    type: String,
    required: true
  },
  Rodents: {
    type: Boolean,
    default: false
  },
  ExoticAnimals: {
    type: Boolean,
    default: false
  },
  WebsiteURL: {
    type: String,
    validate: {
      validator: (value) => /^((http:\/\/www\.)|(www\.)|(http:\/\/))[a-zA-Z0-9._-]+\.[a-zA-Z./]{2,6}$/ig.test(value),
      message: 'invalid website url'
    }
  },
  Phone: {
    type: String,
    validate: {
      validator: (value) => /^[0-9- _]{3,15}\d+$/ig.test(value),
      message: 'invalid phone number'
    }
  },
  Accepted: {
    type: Boolean,
    default: false
  },
  AcceptedDate: {
    type: Date,
    default: Date.now()
  },
  SuggestedBy: {
    type: [Schema.Types.ObjectId],
    ref: 'users'
  },
  AcceptedBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
});

// Indexes
VetSchema.index({ Position: '2dsphere' });



/***** STATIC METHODS ******/

/**
 * Used to find vet places within specified range
 * @param {Number} range Range to search within in meters
 * @param {Number} lat Lattitude of the origin point
 * @param {Number} lng Longitude of the origin point
 * @returns {Array} A collection of retrieved vets
 */
VetSchema.statics.findWithinRange = function(range, lat, lng) {
  lat = parseFloat(lat);
  lng = parseFloat(lng);
  range = parseInt(range);
  return this.find({
    Position: {
      $near:{
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: range
      }
    },
    Accepted: true
  });
};

/**
 * Used to retrieve all vets with name or address matching provided string.
 * @param {string} search Name or address to perform the search with.
 * @returns {Promise} Query results
 */
VetSchema.statics.findByNameOrAddress = function(search) {
  return this.find({
    $or: [
      { Address: new RegExp(`${search}`, 'i') },
      { Name: new RegExp(`${search}`, 'i') }
    ]
  });
};

/**
 * Used to retrieve all users who suggested selected Vet.
 * @param {String} vetId ID string for selected Vet
 * @returns {Array} An array of user references
 */
VetSchema.statics.getUserSuggestions = function(vetId) {
  return new Promise(async (resolve, reject) => {
    const vet = await this.findById(vetId)
      .populate({
        path: 'SuggestedBy',
        model: 'users',
        select: '_id Nickname AvatarURL Role'
      })
      .catch((err) => {
        logger.error('Error retrieving user suggestions', err);
        throw err;
      });
    if (!vet) return reject();
    return resolve(vet.SuggestedBy);
  });
};



/***** INSTANCE METHODS ******/

/**
 * Used when user wants to recommend a vet place to become officially recommended.
 * @param {ObjectID} user User that we want to toggle the recommendation for.
 * @returns {Promise} result of performed query
 */
VetSchema.methods.toggleUserRecommendation = function(user) {
  const index = this.SuggestedBy.indexOf(user._id);
  if (index > -1) {
    const removed = this.SuggestedBy.slice(index, 1);
  } else {
    this.SuggestedBy.push(user._id);
  }
  return this.save();
};



/***** EXPORT ******/

const VetsModel = mongoose.model('vets', VetSchema);

module.exports = VetsModel;