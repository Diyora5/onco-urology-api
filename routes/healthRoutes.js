const express = require('express');
const router = express.Router();

router.get('/liveness', (req, res) => {
  res.json({ success: true, status: 'alive' });
});

router.get('/readiness', async (req, res) => {
  // Basic readiness check: DB connectivity if available.
  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    res.json({ success: true, status: 'ready' });
  } catch (e) {
    res.status(503).json({ success: false, status: 'not-ready' });
  }
});

router.get('/healthz', (req, res) => {
  res.json({ success: true });
});

module.exports = router;

