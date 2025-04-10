const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Load environment variables
require('dotenv').config();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
};

// Register new user
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Create new user
    const newUser = new User({
      username,
      password
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: info.message || 'Authentication failed' 
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    
    return res.json({ 
      success: true, 
      token, 
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  })(req, res, next);
});

// Get current user profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user._id,
      username: req.user.username,
      createdAt: req.user.createdAt
    }
  });
});

// Check if token is valid
router.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ 
    success: true, 
    message: 'Token is valid',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Delete user account
router.delete('/delete-account', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Delete the user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting account'
    });
  }
});

module.exports = router;