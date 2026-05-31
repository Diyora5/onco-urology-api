require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const employeeRoutes = require('./routes/employeeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const employeeProfileRoutes = require('./routes/employeeProfile.routes');
const employeeWorkExperienceRoutes = require('./routes/employeeWorkExperience.routes');
const employeeEducationRoutes = require('./routes/employeeEducation.routes');
const departmentInfoRoutes = require('./routes/departmentInfoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Doctor info API is running' });
});

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/department-info', departmentInfoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);
// Profile / work-experience / education routers define their full sub-paths.
app.use('/api', employeeProfileRoutes);
app.use('/api', employeeWorkExperienceRoutes);
app.use('/api', employeeEducationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models. `alter: true` is used here temporarily for development so
    // new tables/columns are applied without dropping data.
    // For production, use proper Sequelize migrations instead.
    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
