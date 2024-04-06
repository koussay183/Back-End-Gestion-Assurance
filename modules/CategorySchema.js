const mongoose = require('mongoose');

const c = new mongoose.Schema({
  title : {type : String , required : true},
  active : {type : Boolean , default : true},
  BoutiqueId : {type : mongoose.Schema.Types.ObjectId , ref : "boutique" , required : true}
});

const Category = mongoose.model('category', c);

module.exports = Category;