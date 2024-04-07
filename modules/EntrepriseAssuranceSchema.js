const mongoose = require('mongoose');

const e = new mongoose.Schema({
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

const EntrepriseAssurance = mongoose.model('entreprise-assurance', e);

module.exports = EntrepriseAssurance;