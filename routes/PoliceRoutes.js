require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const Police = require("../modules/PoliceSchema");
const jwt = require("jsonwebtoken");

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const e = await Police.findOne({ email, password });
      
      if (e) {
        
        // Generate JWT token
        const token = jwt.sign({ id: e._id , role :"police" }, process.env.SECRET_KEY , {expiresIn : "1h"});
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only for security
        res.json({token : token , data : e , role : "police"});
      } else {
        res.status(401).json('Invalid credentials');
      }
    } catch (error) {
      res.status(500).json(error);
    }
});

router.post('/signup',async(req, res) => {
    try {
      const e = new Police(req.body);
      await e.save();
      res.status(201).json(e);
    } catch (error) {
      res.status(400).json(error);
    }
})

module.exports = router;