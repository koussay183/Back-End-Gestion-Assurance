const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  worksFor: {
    type: String,
    enum: ["boutique", "entreprise-assurance", "entreprise-reparation"],
    required: true
  },
  boutiqueId: { type: mongoose.Schema.Types.ObjectId, ref: "Boutique" },
  entrepriseAssuranceId: { type: mongoose.Schema.Types.ObjectId, ref: "EntrepriseAssurance" },
  entrepriseReparationId: { type: mongoose.Schema.Types.ObjectId, ref: "EntrepriseReparation" },
  accessLevel: { type: String, enum: ["full", "normal"], required: true }
});

const Employee = mongoose.model('employee', employeeSchema);

module.exports = Employee;