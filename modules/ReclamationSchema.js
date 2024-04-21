const mongoose = require('mongoose');

const r = new mongoose.Schema({
  ContratId : {type : mongoose.Schema.Types.ObjectId , ref : "contrat" , required : true},
  userId : {type : mongoose.Schema.Types.ObjectId , ref : "user" , required : true},
  vol : {type : Boolean , required : true},
  desc : {type : String , required : true},
  state : {type : String , enum : ["rejeter","reparer","rembourser","waiting"] , default : "waiting"} ,
  remboursable : {type : Number , default : 0},
  EntrepriseReparationId : {type : mongoose.Schema.Types.ObjectId , ref : "entreprise-reparation"},
  pending : {type : Boolean , default : true}
});

const Reclamation = mongoose.model('reclamation', r);

module.exports = Reclamation;