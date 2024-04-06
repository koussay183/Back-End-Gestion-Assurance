require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const Boutique = require("../modules/BoutiqueSchema");
const jwt = require("jsonwebtoken");

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

router.post('/signup',async(req, res) => {
    try {
      const b = new Boutique(req.body);
      await b.save();
      res.status(201).json(b);
    } catch (error) {
      res.status(400).json(error);
    }
});

module.exports = router;