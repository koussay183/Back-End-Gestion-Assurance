const mongoose = require('mongoose');

const boutique = new mongoose.Schema({
  name: {
    type: String,
    required: true , 
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

const Boutique = mongoose.model('boutique', boutique);

module.exports = Boutique;