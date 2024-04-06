const express = require('express')
const app = express()
const cors = require("cors")
const port = 3000
const mongoose = require("mongoose");

// Middlewares
app.use(cors());
app.use(express.json());

// Importing Routes Handlers
const BoutiqueRoutes = require("./routes/BoutiqueRoutes");
const EntrepriseAssuranceRoutes = require("./routes/EntrepriseAssuranceRoutes");
const PoliceRoutes = require("./routes/PoliceRoutes");
const EntrepriseReparationRoutes = require("./routes/EntrepriseReparationRoutes")
const UserRoutes = require("./routes/UserRoutes")

// Routes
app.use("/boutique",BoutiqueRoutes);
app.use("/entreprise-assurance",EntrepriseAssuranceRoutes);
app.use("/police",PoliceRoutes);
app.use("/entreprise-reparation",EntrepriseReparationRoutes);
app.use("/user",UserRoutes);

// App Start
app.listen(port, () => {
    // Connect to MongoDB 
    mongoose.connect('mongodb+srv://koussaybnit:rPTly4S3q1qA311P@gestion.pdbnzdp.mongodb.net/?retryWrites=true&w=majority&appName=Gestion', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName : "Gestion"
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
  console.log(`App Listening on Port ${port}`)
})

