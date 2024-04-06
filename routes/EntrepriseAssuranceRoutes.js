require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const EntrepriseAssurance = require("../modules/EntrepriseAssuranceSchema");
const Auth = require("../middlewares/EntrepriseAssuranceAuth");

const jwt = require("jsonwebtoken");

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

router.post('/signup',async(req, res) => {
    try {
      const e = new EntrepriseAssurance(req.body);
      await e.save();
      res.status(201).json(e);
    } catch (error) {
      res.status(400).json(error);
    }
})

router.get('/get-by-id/:id', Auth, async (req, res) => {
  try {
    const E = await EntrepriseAssurance.findById(req.params.id);
    if (!E) return res.status(404).send('Entreprise not found');
    res.json(E);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

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