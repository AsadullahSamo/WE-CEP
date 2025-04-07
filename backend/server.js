const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// Import routes
const agriculturalRoutes = require('./api/agriculturalApi');
const dataSourceRoutes = require('./api/dataSourceApi');
const authRoutes = require('./api/authApi');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pakistan-data', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/agricultural', agriculturalRoutes);
app.use('/api/data-sources', dataSourceRoutes);
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Pakistan Data Reporting System API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 