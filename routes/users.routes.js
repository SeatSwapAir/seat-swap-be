const express = require('express');
const router = express.Router();
const { getFlightsByUser } = require('../controllers/users.controllers');
router.get('/users/:user_id/flights', (req, res, next) => {
  getFlightsByUser(req, res, next);
});

module.exports = router;
