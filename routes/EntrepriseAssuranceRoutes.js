require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const EntrepriseAssurance = require("../modules/EntrepriseAssuranceSchema");
const EntrepriseReparation = require("../modules/EntrepriseReparationSchema");
const Auth = require("../middlewares/EntrepriseAssuranceAuth");
const Employee =require("../modules/EmployeeSchema")
const jwt = require("jsonwebtoken");
const Contrat = require("../modules/ContratSchema")
const Reclamation = require('../modules/ReclamationSchema');

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

// here can add empolyee
router.post('/add-employee',Auth, async (req, res) => {
  try {
    // Create a new employee instance using the Employee model
    const newEmployee = new Employee({...req.body,entrepriseAssuranceId:req.id,worksFor : "entreprise-assurance"});

    // Save the employee to the database
    const savedEmployee = await newEmployee.save();

    // If the employee is saved successfully, send a success response
    res.status(201).json(savedEmployee);
  } catch (err) {
    // If an error occurs, send an error response
    res.status(400).json({ message: err.message });
  }
});


// Route to get all reclamations by EntrepriseAssurance ID
router.get('/reclamations',Auth, async (req, res) => {
  const entrepriseAssuranceId = req.id;

  try {
    // Find all contrats where EntrepriseReparationId matches the provided ID
    const contrats = await Contrat.find({ EntrepriseReparationId: entrepriseAssuranceId });

    // Extract the ContratIds from the found contrats
    const contratIds = contrats.map(contrat => contrat._id);

    // Find all reclamations where ContratId matches any of the found ContratIds
    const reclamations = await Reclamation.find({ ContratId: { $in: contratIds } });

    // If there are no reclamations found, send a 404 error response
    if (!reclamations || reclamations.length === 0) {
      return res.status(404).json({ message: 'No reclamations found for the provided Entreprise Assurance ID' });
    }

    // If reclamations are found, send them in the response
    res.json(reclamations);
  } catch (err) {
    // If an error occurs, send an error response
    res.status(500).json({ message: err?.message });
  }
});

// Route to handle updating a reclamation based on action (rejeter, rembourser, or reparer)
router.put('/reclamation/:reclamationId/update', Auth ,async (req, res) => {
  const { reclamationId } = req.params;
  const { action } = req.body;

  try {
    // Find the reclamation by ID
    const reclamation = await Reclamation.findById(reclamationId);

    if (!reclamation) {
      return res.status(404).json({ message: 'Reclamation not found' });
    }

    // Handle the different actions
    switch (action) {
      case 'rejeter':
        // Set state to "rejeter" and pending to false
        reclamation.state = 'rejeter';
        reclamation.pending = false;
        break;
      case 'rembourser':
        // Set state to "rembourser", set remboursable from req.body, and pending to false
        reclamation.state = 'rembourser';
        reclamation.remboursable = req.body.remboursable;
        reclamation.pending = false;
        break;
      case 'reparer':
        // Find all entrepriseReparation and calculate the one with the least reclamations
        const entreprises = await EntrepriseReparation.find({});
        let minReclamations = Infinity;
        let selectedEntrepriseId = null;

        for (const entreprise of entreprises) {
          const reclamationsCount = await Reclamation.countDocuments({ EntrepriseReparationId: entreprise._id });
          if (reclamationsCount < minReclamations) {
            minReclamations = reclamationsCount;
            selectedEntrepriseId = entreprise._id;
          }
        }

        // Set EntrepriseReparationId to the selectedEntrepriseId without setting pending to false
        reclamation.EntrepriseReparationId = selectedEntrepriseId;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

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