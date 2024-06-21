const express = require('express');
const router = express.Router();
const { getFlightsByUser } = require('../controllers/flights.controllers');
router.get('/flights/:user_id', (req, res, next) => {
  getFlightsByUser(req, res, next);
});

module.exports = router;
