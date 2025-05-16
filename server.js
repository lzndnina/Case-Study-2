const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode'); // Add this at the top
require('dotenv').config();

const User = require('./models/User');
const Resident = require('./models/Resident');

const app = express();
const PORT = process.env.PORT || 5002;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

const fs = require('fs');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000' 
}));
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/residents';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    const normalizedUsers = users.map(user => ({
      ...user.toObject(),
      id: user._id,
    }));
    res.json(normalizedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error });
  }
});


// Update User
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;  // Or adjust to match frontend

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Verify Token
app.get('/api/verifyToken', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ role: decoded.role });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// CRUD Operations

// Create (C) - Save resident data
app.post('/students', async (req, res) => {
  const { id, name, gender, contact, address, employmentstatus, housenum, health, birthday, householdcount } = req.body;

  if (!id || !name || !gender || !contact || !address || !employmentstatus || !housenum || !health || !birthday || !householdcount) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingResident = await Resident.findOne({ id });
    if (existingResident) {
      return res.status(409).json({ message: 'Resident already exists' });
    }

    const newResident = new Resident({ id, name, gender, contact, address, employmentstatus, housenum, health, birthday, householdcount });
    await newResident.save();

    res.status(201).json({ message: 'Resident saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save resident', error });
  }
});

// Read (R) - Get all residents
app.get('/students', async (req, res) => {
  try {
    const residents = await Resident.find();
    const formattedResidents = residents.map(resident => ({
      ...resident.toObject(),
      birthday: new Date(resident.birthday).toLocaleDateString('en-US') // Format birthdate
    }));
    res.json(formattedResidents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve residents', error });
  }
});

// Read (R) - Get resident by ID
app.get('/students/qr/:id', async (req, res) => {
  try {
    const resident = await Resident.findOne({ id: req.params.id });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    const formattedResident = {
      ...resident.toObject(),
      birthday: new Date(resident.birthday).toLocaleDateString('en-US') // Format birthdate
    };

    res.json(formattedResident);
  } catch (error) {
    console.error('Error retrieving resident:', error);
    res.status(500).json({ message: 'Failed to retrieve resident', error });
  }
});

// Generate QR Code for a resident
app.get('/students/:id/qrcode', async (req, res) => {
  const { id } = req.params;

  try {
    const resident = await Resident.findOne({ id });
    if (!resident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Encode meaningful data into the QR code
    const qrData = JSON.stringify({
      id: resident.id,
      name: resident.name,
      address: resident.address,
      housenum: resident.housenum,
    });

    console.log('Data encoded in QR code:', qrData); // Log the data for debugging

    const qrCode = await QRCode.toDataURL(qrData);
    res.json({ qrCode });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code', error });
  }
});

// Update (U) - Update resident data
app.put('/students/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    const updatedResident = await Resident.findOneAndUpdate({ id }, updates, { new: true });
    if (!updatedResident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.status(200).json({ message: 'Resident updated successfully', updatedResident });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update resident', error });
  }
});

// Delete (D) - Remove resident by ID
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deletedResident = await Resident.findOneAndDelete({ id });
    if (!deletedResident) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    res.status(200).json({ message: 'Resident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resident', error });
  }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Deleting user with ID:', id);
  console.log('Received request to delete user with ID:', id);

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      console.log('User not found with ID:', id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User deleted successfully:', deletedUser);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Initial user creation
const createInitialUsers = async () => {
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'editor', password: 'editor123', role: 'editor' },
    { username: 'viewer', password: 'viewer123', role: 'viewer' }
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ username: user.username });
    if (!existingUser) {
      const newUser = new User(user);
      await newUser.save();
    }
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await createInitialUsers(); // Create initial users when the server starts
});