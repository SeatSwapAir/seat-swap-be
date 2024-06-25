const express = require('express');
const router = express.Router();
const { getFlightsByUserFlightId, removeFlightByUserFlightId } = require('../controllers/flights.controllers');
router.get('/flights/:user_id', (req, res, next) => {
  getFlightsByUser(req, res, next);
});

router.delete('/flights/:user_flight_id', (req, res, next) => {
  removeFlightByUserFlightId(req, res, next);
});

router.get('/flights/:user_flight_id', (req, res, next) => {
  getFlightsByUserFlightId(req, res, next);
});

module.exports = router;
