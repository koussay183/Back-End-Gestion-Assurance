require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const Boutique = require("../modules/BoutiqueSchema");
const jwt = require("jsonwebtoken");
const Contrat = require("../modules/ContratSchema");
const BoutiqueAuth = require("../middlewares/BoutiqueAuth");
const Category = require("../modules/CategorySchema");
const Product = require("../modules/ProductSchema");
const Employee =require("../modules/EmployeeSchema")

// here boutique can do a signup with unique email 
router.post('/signup',async(req, res) => {
  try {
    const b = new Boutique(req.body);
    await b.save();
    res.status(201).json(b);
  } catch (error) {
    res.status(400).json(error);
  }
});


// here boutique can login , if auth the server will generate a jwt token with role and id in it and return it in cookies and body
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const b = await Boutique.findOne({ email, password });
      
      if (b) {
        
        // Generate JWT token
        const token = jwt.sign({ id: b._id , role :"boutique" }, process.env.SECRET_KEY , {expiresIn : "1h"});
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only for security
        res.json({token : token , data : b , role : "boutique" , login : true});
      } else {
        res.status(401).json('Invalid credentials');
      }
    } catch (error) {
      res.status(500).json(error);
    }
});


// here boutique can create categorys
// the auths functions will handle the check of the jwt and the role (can create the category only when auth)
router.post('/create-category',BoutiqueAuth,async(req, res) => {
  try {
    // Check if a category with the same name already exists for the boutique
    const existingCategory = await Category.findOne({
      title: req.body.title,
      BoutiqueId: req.boutiqueId
    });

    if (existingCategory) {
      return res.status(400).json({ message: "A category with the same name already exists for this boutique." });
    }
    const c = new Category({...req.body , BoutiqueId : req.boutiqueId});
    await c.save();
    res.status(201).json(c);
  } catch (error) {
    res.status(400).json(error);
  }
});


// here boutique can create a product
router.post('/add-product',BoutiqueAuth,async(req, res) => {
  try {
    const p = new Product({...req.body ,BoutiqueId : req.boutiqueId });
    await p.save();
    res.status(201).json(p);
  } catch (error) {
    res.status(400).json(error);
  }
});


// this route will allow boutique to get all contrats that have its boutique id
// the auths functions will handle the check of the jwt and the role (can get contracts only when auth and have the same id)
router.post('/contracts', BoutiqueAuth,  async (req, res) => {
  try {
      
      const boutiqueId = req.boutiqueId
      let contracts;

      
      contracts = await Contrat.find({BoutiqueId : boutiqueId}).populate('ProductId');
      

      res.status(200).json({ contracts });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
  }
});


// herecan see categories for a boutique with id
router.get('/categories/:boutiqueId', async (req, res) => {
  try {
    const boutiqueId = req.params.boutiqueId;

    // Fetch all categories for the provided boutiqueId
    const categories = await Category.find({ BoutiqueId: boutiqueId }).populate('EntrepriseAssurance').exec();

    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json(error);
  }
});


// here the boutique when authed and have an jwt can create an employee and give him an acessLevel
router.post('/add-employee',BoutiqueAuth, async (req, res) => {
  try {
    // Create a new employee instance using the Employee model
    const newEmployee = new Employee({...req.body,boutiqueId:req.boutiqueId,worksFor : "boutique"});

    // Save the employee to the database
    const savedEmployee = await newEmployee.save();

    // If the employee is saved successfully, send a success response
    res.status(201).json(savedEmployee);
  } catch (err) {
    // If an error occurs, send an error response
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;