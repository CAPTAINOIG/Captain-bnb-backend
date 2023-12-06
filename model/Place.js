const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nameOfHost: String,
    title: String,
    address: String,
    photos: [String],
    description: String,
    perks: [String],
    extraInfo: String,
    checkIn: Number,
    checkOut: Number,
    maxGuests: Number,
    price: Number,
    bed: Number,
    bath: Number,
    bedroom: Number,
    date: {
      type: String,
      default: () => new Date().toLocaleDateString(), // Default value for date
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString(), // Default value for time
    },
  },
  { timestamps: true } // Adding timestamps option will automatically add createdAt and updatedAt fields
);

const PlaceModel = mongoose.model('Place', placeSchema);

module.exports = PlaceModel;
