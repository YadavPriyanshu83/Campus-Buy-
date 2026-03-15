const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  console.log('\n=== AUTH MIDDLEWARE ===\n');
  console.log('Request path:', req.originalUrl);
  console.log('Request method:', req.method);
  
  const authHeader = req.headers.authorization;
  console.log('Auth header present:', !!authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('No valid authorization header found');
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token extracted:', token ? token.substring(0, 10) + '...' : 'None');

  try {
    // Verify the token
    console.log('JWT Secret present:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);

    // Fetch the user from the database
    const user = await User.findById(decoded.id).select('-password');
    console.log('User found in database:', !!user);
    
    if (!user) {
      console.error('User not found in database for ID:', decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    console.log('Authentication successful for user:', user.name || user.email);
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
