const mongoose = require('mongoose');

const p = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique : true
  },
  password: {
    type: String,
    required: true
  },
  email : {
    type: String,
    required: true
  }
});

const Police = mongoose.model('police', p);

module.exports = Police;