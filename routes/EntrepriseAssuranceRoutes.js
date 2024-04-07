require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const EntrepriseAssurance = require("../modules/EntrepriseAssuranceSchema");
const Auth = require("../middlewares/EntrepriseAssuranceAuth");

const jwt = require("jsonwebtoken");

// here entreprise can signup with unique name
router.post('/signup',async(req, res) => {
  try {
    const e = new EntrepriseAssurance(req.body);
    await e.save();
    res.status(201).json(e);
  } catch (error) {
    res.status(400).json(error);
  }
});


// here can login and get a token for auth with id and role
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const e = await EntrepriseAssurance.findOne({ email, password });
      
      if (e) {
        
        // Generate JWT token
        const token = jwt.sign({ id: e._id , role :"EntrepriseAssurance" }, process.env.SECRET_KEY , {expiresIn : "1h"});
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only for security
        res.json({token : token , data : e , role : "EntrepriseAssurance"});
      } else {
        res.status(401).json('Invalid credentials');
      }
    } catch (error) {
      res.status(500).json(error);
    }
});


// here can get entreprise data by id but when just authed and have the same id provided
router.get('/get-by-id/:id', Auth, async (req, res) => {
  try {
    const E = await EntrepriseAssurance.findById(req.params.id);
    if(req.id !== id) return res.status(400).json({error : "Not Auth !"})
    if (!E) return res.status(404).send('Entreprise not found');
    res.json(E);
  } catch (error) {
    res.status(500).send(error);
  }
});


// here can get entreprises by name with pagination page and limit par page (searching)
router.get('/get-by-name/:name', async (req, res) => {
  try {
    
    const name = req.params.name;

    // Search for the EntrepriseAssurance document by name
    const entreprises = await EntrepriseAssurance.find({ name: { $regex: name, $options: 'i' } });

    if (!entreprises.length) {
      return res.status(404).send('No entreprises found matching the search criteria');
    }

    res.json(entreprises);
  } catch (error) {
    res.status(500).send(error);
  }
});


// here can get all entreprises with pagination page and limit par page 
router.get('/get-all', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default limit 10 if not provided

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Query to fetch EntrepriseAssurance documents with pagination
    const E = await EntrepriseAssurance.find()
      .skip(skip)
      .limit(limit)
      .exec();

    // If no EntrepriseAssurance documents found, return 404
    if (E.length === 0) {
      return res.status(404).send('No Entreprises Yet');
    }

    res.json(E);
  } catch (error) {
    res.status(500).send(error);
  }
});


// here can update profile for entreprise just when have the same id in token
router.put('/update/:id', Auth ,async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;
  if(req.id !== id) return res.status(400).json({error : "Not Auth !"})
  try {
    // Find the entrepriseassurance document by ID
    const entrepriseassurance = await EntrepriseAssurance.findById(id);

    if (!entrepriseassurance) {
      return res.status(404).json({ message: 'EntrepriseAssurance not found' });
    }

    // Update the fields
    Object.keys(updateFields).forEach(key => {
      entrepriseassurance[key] = updateFields[key];
    });

    // Save the updated entrepriseassurance document
    await entrepriseassurance.save();

    res.status(200).json({ message: 'EntrepriseAssurance updated successfully', updatedData: entrepriseassurance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;