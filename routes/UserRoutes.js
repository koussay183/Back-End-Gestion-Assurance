require('dotenv').config(); // Load Environment Variables
const express = require('express');
const router = express.Router();
const User = require("../modules/UserSchema");
const jwt = require("jsonwebtoken");
const Contrat = require("../modules/ContratSchema");
const UserAuth = require("../middlewares/UserAuth");
const Boutique = require("../modules/BoutiqueSchema");
const Product = require("../modules/ProductSchema");
const Reclamation = require("../modules/ReclamationSchema");

// user can signup with unique email
router.post('/signup',async(req, res) => {
    try {
      const e = new User(req.body);
      await e.save();
      res.status(201).json(e);
    } catch (error) {
      res.status(400).json(error);
    }
});


// user can login and get a token for auth
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const e = await User.findOne({ email, password });
    
    if (e) {
      
      // Generate JWT token
      const token = jwt.sign({ id: e._id , role :"user" }, process.env.SECRET_KEY , {expiresIn : "1h"});
      // Set token in cookie
      res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only for security
      res.json({token : token , data : e , role : "user"});
    } else {
      res.status(401).json('Invalid credentials');
    }
  } catch (error) {
    res.status(500).json(error);
  }
});


// here user can get boutiques even if he's not auth (with pagination pass page & limit)
// GET /get-boutiques?page=2&limit=10
// This will fetch the second page of boutiques with 10 boutiques per page.
router.get('/get-boutiques', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default limit 10 if not provided

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Query to fetch boutiques with pagination
    const boutiques = await Boutique.find({}).select("-password")
      .skip(skip)
      .limit(limit)
      .exec();

    // Count total number of boutiques
    const totalBoutiques = await Boutique.countDocuments();

    res.status(200).json({
      boutiques,
      currentPage: page,
      totalPages: Math.ceil(totalBoutiques / limit)
    });
  } catch (error) {
    res.status(400).json(error);
  }
});


// here user can get all products for a categoryId
router.get('/products/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Fetch all products for the provided categoryId
    const products = await Product.find({ CategoryId: categoryId });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// here user can search for products by name -> /search-products?name=productName
router.get('/search-products', async (req, res) => {
  try {
    const { name } = req.query;

    // Perform a case-insensitive search for products by name or partial name match
    const products = await Product.find({ title: { $regex: name, $options: 'i' } });

    if (!products.length) {
      return res.status(404).send('No products found matching the search criteria');
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Here User Will By A Product This Means User Will Create a Contrat but not Signed , You Should Add Auth Mid To check if User Have a token and create a contrat and check if user with sign false
router.post('/buy-product', UserAuth , async (req, res) => {
  try {
    // Destructuring request body to extract fields
    const { BoutiqueId, CategoryId, ProductId, Garantie,ContratAssuranceProtectionVol, ContratAssuranceType , ContratAssurancePrixJour , ContratAssuranceDebut , ContratAssuranceFin} = req.body;

    // Assuming you have userId available from the auth middleware
    const UserId = req.userId;

    // Create the contract
    const contract = await Contrat.create({
      UserId: UserId , // Assuming UserId can be provided, otherwise use userId from auth
      ProductId,
      BoutiqueId,
      CategoryId,
      Garantie: Garantie || 0, // Default value of 0 if not provided
      ContratAssuranceType,
      ContratAssurancePrixJour ,
      ContratAssuranceDebut , 
      ContratAssuranceFin,
      ContratAssuranceProtectionVol
    });

    res.status(201).json({ contract });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// here user can see all of his contracts
router.get('/contracts/:userId', UserAuth ,async (req, res) => {
  try {
    const userId = req.params.userId;
    if(req.userId !== userId) return res.json({error : "Not Auth Same Id Needed"});

    // Fetch all contracts for the provided userId
    const contracts = await Contrat.find({ UserId: userId });

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// here user can create reclamation assosiated to an contrat
router.post("/create-reclamation/:idContrat",UserAuth,async (req,res)=>{
  try {
    const { idContrat } = req.params;
    const r = new Reclamation({userId : req.userId , ContratId : idContrat , desc : req.body?.desc ,vol : req.body?.vol})
    await r.save();
    res.status(200).json(r)
  } catch (error) {
    res.status(400).json(error);
  }
})

module.exports = router;