const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/protected'));
// Test route
app.get('/', (req, res) => res.send('API running'));

// Start server
app.listen(5000, () => console.log('Server started'));
app.get('/api/check', (req, res) => {
  res.send("Working");
});
