require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const EntrepriseReparation = require("../modules/EntrepriseReparationSchema");
const jwt = require("jsonwebtoken");
const Employee =require("../modules/EmployeeSchema")
const EntrepriseAssuranceAuth = require("../middlewares/EntrepriseReparationAuth")
const Reclamation = require("../modules/ReclamationSchema");


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const e = await EntrepriseReparation.findOne({ email, password });
      
      if (e) {
        
        // Generate JWT token
        const token = jwt.sign({ id: e._id , role :"entrepriseReparation" }, process.env.SECRET_KEY , {expiresIn : "1h"});
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only for security
        res.json({token : token , data : e , role : "entrepriseReparation"});
      } else {
        res.status(401).json('Invalid credentials');
      }
    } catch (error) {
      res.status(500).json(error);
    }
});

router.post('/signup',async(req, res) => {
    try {
      const e = new EntrepriseReparation(req.body);
      await e.save();
      res.status(201).json(e);
    } catch (error) {
      res.status(400).json(error);
    }
})

// here can add employee
router.post('/add-employee',EntrepriseAssuranceAuth, async (req, res) => {
  try {
    // Create a new employee instance using the Employee model
    const newEmployee = new Employee({...req.body,entrepriseReparationId:req.id,worksFor : "entreprise-reparation"});

    // Save the employee to the database
    const savedEmployee = await newEmployee.save();

    // If the employee is saved successfully, send a success response
    res.status(201).json(savedEmployee);
  } catch (err) {
    // If an error occurs, send an error response
    res.status(400).json({ message: err.message });
  }
});

// Route to get all pending reclamations for a specific EntrepriseReparation
router.get('/reclamation/pending',EntrepriseAssuranceAuth, async (req, res) => {
  

  try {
    // Find all reclamations where EntrepriseReparationId matches the provided ID and pending is true
    const reclamations = await Reclamation.find({ EntrepriseReparationId: req.id, pending: true });

    // If there are no reclamations found, send a 404 error response
    if (!reclamations || reclamations.length === 0) {
      return res.status(404).json({ message: 'No pending reclamations found for the provided EntrepriseReparation ID' });
    }

    // If reclamations are found, send them in the response
    res.json(reclamations);
  } catch (err) {
    // If an error occurs, send an error response
    res.status(500).json({ message: err?.message });
  }
});

// Route to update a reclamation, setting pending to false and status to "reparer"
router.put('/reclamation/:reclamationId/update',EntrepriseAssuranceAuth, async (req, res) => {
  const { reclamationId } = req.params;

  try {
    // Find the reclamation by ID
    const reclamation = await Reclamation.findById(reclamationId);

    if (!reclamation) {
      return res.status(404).json({ message: 'Reclamation not found' });
    }

    // Set pending to false and status to "reparer"
    reclamation.pending = false;
    reclamation.state = 'reparer';

    // Save the updated reclamation
    await reclamation.save();

    // Respond with the updated reclamation
    res.json(reclamation);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: err?.message });
  }
});

module.exports = router;