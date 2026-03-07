import express from 'express';
import connectToDatabase from '../lib/mongodb.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

const router = express.Router();

// Get all users (Protected, Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    // Replace with actual Mongoose model
    // const users = await User.find({});
    res.json({ message: 'Users API endpoint (Secured)', users: [] });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a user (Protected, Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    // const newUser = new User(req.body);
    // await newUser.save();
    res.status(201).json({ message: 'User created securely' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
