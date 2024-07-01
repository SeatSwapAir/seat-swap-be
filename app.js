const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const { getFlightsByUser, removeJourneyByUserIdAndFlightId } = require('./controllers/users.controllers.js');

app.get('/api/users/:user_id/flights', getFlightsByUser);
app.delete('/api/users/:user_id/flights/:flight_id',removeJourneyByUserIdAndFlightId );

//handle custom errors
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

//handle Database errors
app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: 'server error getting API' });
});

module.exports = { app };
