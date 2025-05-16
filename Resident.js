// filepath: /Users/kayevillar/Documents/CaseStudy1/redis-backend/models/Resident.js
const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  employmentstatus: { type: String, required: true },
  housenum: { type: String, required: true },
  health: { type: String, required: true },
  birthday: { type: Date, required: true },
  householdcount: { type: Number, required: true },
});

module.exports = mongoose.model('Resident', residentSchema);