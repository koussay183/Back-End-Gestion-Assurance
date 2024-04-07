const mongoose = require('mongoose');

const u = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email : {
    type: String,
    required: true,
    unique : true
  }
});

const User = mongoose.model('user', u);

module.exports = User;