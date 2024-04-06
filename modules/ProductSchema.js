const mongoose = require('mongoose');

const p = new mongoose.Schema({
  BoutiqueId : {type : mongoose.Schema.Types.ObjectId , ref : "boutique" , required : true},
  CategoryId : {type : mongoose.Schema.Types.ObjectId , ref : "category" , required : true},
  title : {type : String , required : true},
  desc : {type : String , required : true} ,
  imagesUrls : [String],
  price : {type : Number , required : true},
  inStock : {type : Boolean ,  default : true}
});

const Product = mongoose.model('product', p);

module.exports = Product;