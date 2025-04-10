const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// Local strategy for username/password authentication
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Find user by username
      const user = await User.findOne({ username });
      
      // If user doesn't exist
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      // If authentication successful
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT strategy for token authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Find the user based on the JWT payload
    const user = await User.findById(payload.id);
    
    if (!user) {
      return done(null, false);
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport; 