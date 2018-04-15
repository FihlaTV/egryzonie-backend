const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const { Schema } = mongoose;

const VetSchema = new Schema({
  GoogleMapsID: {
    type: String,
    required: [true, 'GoogleMapsID is missing'],
    unique: [true, 'GooeleMapsID must be unique'],
    validate: {
      validator: (value) => /^[A-Za-z0-9_]{27,30}$/g.test(value),
      message: 'google maps id is invalid'
    }
  },
  Position: {
    type: [Schema.Types.Double],
    coordinates: [Schema.Types.Double],
    required: [true, 'coordinates are missing'],
    validate: {
      validator: (value) => {
        if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string') {
          value = parseFloat(value[0].split(','));
        }
        return value[0] <= 90 && value[0] >= -90 && value[1] <= 180 && value[1] >= -180;
      },
      message: 'coordinates are invalid'
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

VetSchema.statics.findWithinRange = function(range, lat, lng) {
  return this.find({
    $near: [lat, lng],
    Accepted: true
  });
};

VetSchema.methods.toggleUserRecommendation = function(user) {
  const index = this.SuggestedBy.indexOf(user._id);
  if (index > -1) {
    const removed = this.SuggestedBy.slice(index, 1);
  } else {
    this.SuggestedBy.push(user._id);
  }
  return this.save();
};


mongoose.model('vets', VetSchema);
