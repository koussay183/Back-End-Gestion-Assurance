require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const User = require("../modules/UserSchema");
const jwt = require("jsonwebtoken");

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

router.post('/signup',async(req, res) => {
    try {
      const e = new User(req.body);
      await e.save();
      res.status(201).json(e);
    } catch (error) {
      res.status(400).json(error);
    }
})

module.exports = router;