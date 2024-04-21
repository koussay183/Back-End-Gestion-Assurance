require('dotenv').config(); // Load environment variables
const express = require('express');
const router = express.Router();
const Employee =require("../modules/EmployeeSchema")

router.post('/login/:worksFor/:id', async (req, res) => {
    const { email, password } = req.body;
    const {worksFor , id} = req.params
    try {
        var query = {}
        if(worksFor === "boutique") {
            query = { email, password ,worksFor : worksFor , boutiqueId : id}
        }else if (worksFor === "entreprise-assurance") {
            query = { email, password ,worksFor : worksFor , entrepriseAssuranceId : id}
        }else if (worksFor === "entreprise-reparation") {
            query = { email, password ,worksFor : worksFor , entrepriseReparationId : id}
        }else {
            res.status(400).json({error : "works For Not Valid ! "})
        }
      const b = await Employee.findOne(query);
      
      if (b) {
        
        // Generate JWT token
        const token = jwt.sign({ id: b._id , role :"employee" ,  accessLevel : b?.accessLevel}, process.env.SECRET_KEY , {expiresIn : "9999h"});
        // Set token in cookie
        res.cookie('token', token, { httpOnly: true }); // Set token as HTTP-only for security
        res.json({token : token , data : b , role : "employee", accessLevel : b?.accessLevel , login : true});
      } else {
        res.status(401).json('Invalid credentials');
      }
    } catch (error) {
      res.status(500).json(error);
    }
});


module.exports = router;