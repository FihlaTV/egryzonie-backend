const mongoose = require('mongoose');
const { Schema } = mongoose;

const VetSchema = new Schema({
  GoogleMapsID: {
    type: String,
    required: [true, 'GoogleMapsID is missing'],
    unique: [true, 'GooeleMapsID must be unique']
  },
  Position: {
    type: String,
    coordinates: [Number]
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
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'users'
  },
  AcceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }
});

VetSchema.statics.findWithinRange = (range, lat, lng) => {
  return this.find({
    $near: [lat, lng],
    Accepted: true
  });
};


mongoose.model('vets', VetSchema);
