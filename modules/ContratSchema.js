const mongoose = require('mongoose');

const c = new mongoose.Schema({
    BoutiqueId : {type : mongoose.Schema.Types.ObjectId , ref : "boutique" , required : true},
    CategoryId : {type : mongoose.Schema.Types.ObjectId , ref : "category" , required : true},
    UserId : {type : mongoose.Schema.Types.ObjectId , ref :"user" , required : true},
    ProductId : {type : mongoose.Schema.Types.ObjectId , ref :"product" , required : true},
    Garantie : {type : Number , default : 0},
    ContratAssuranceType : {type : String , required : true },
    ContratAssurancePrixJour : {type : Number ,  required : true},
    ContratAssuranceDebut : {type : Date , required : true},
    ContratAssuranceFin : {type : Date , required : true},
    ContratAssuranceProtectionVol : {type : Boolean , required : true}
});

const Contrat = mongoose.model('contrat', c);

module.exports = Contrat;