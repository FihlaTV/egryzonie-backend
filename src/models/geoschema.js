const mongoose = require('mongoose');
const { Schema } = mongoose;

const GeoSchema = new Schema({
  type: {
    default: 'Point',
    type: String
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
});

// Export
mongoose.model('geoSchema', GeoSchema);
