const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mentorName: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  starRating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }
});

module.exports = mongoose.model("Course", courseSchema);
