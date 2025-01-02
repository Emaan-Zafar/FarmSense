var express = require("express");
var router = express.Router();
const User = require('../../models/user');
const bcrypt = require("bcryptjs");

// Sign up route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully'});
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

let signedInUser = null; // Store signed-in user in memory

// Sign in route
router.post('/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Store the username and email in memory
     signedInUser = { username: user.username, email: user.email };
  
      res.status(200).json({ message: 'Sign in successful'});
    } catch (error) {
      res.status(500).json({ message: 'Error signing in', error: error.message });
    }
  });

  // Endpoint to get signed-in user's data
router.get('/get-signed-in-user', (req, res) => {
   // Prevent caching by setting cache-control headers
   res.setHeader('Cache-Control', 'no-store');
  if (!signedInUser) {
    return res.status(400).json({ message: 'No user signed in' });
  }

  res.status(200).json(signedInUser);
});
  
// Logout route
router.post('/logout', (req, res) => {
    // This could be handled on the frontend by removing the JWT token
    res.status(200).json({ message: 'Logged out successfully' });
});
  
module.exports = router;
