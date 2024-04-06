const mongoose = require('mongoose');

const r = new mongoose.Schema({
  BoutiqueId : {type : mongoose.Schema.Types.ObjectId , ref : "boutique" , required : true},
  UserId : {type : mongoose.Schema.Types.ObjectId , ref :"user" , required : true},
  ProductId : {type : mongoose.Schema.Types.ObjectId , ref :"product" , required : true},
});

const Reclamation = mongoose.model('reclamation', r);

module.exports = Reclamation;