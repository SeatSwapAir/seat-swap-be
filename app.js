const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config({ path: '.env.amadeus' });

app.use(cors());
app.use(express.json());

const {
  getFlightsByUser,
  removeJourneyByUserIdAndFlightId,
  patchJourneyByUserIdAndFlightId,
  postJourneyByUserIdAndFlightId
} = require('./controllers/users.controllers.js');

const {
  getFlightByNumberAndDate,
} = require('./controllers/flights.controllers');

app.get('/api/users/:user_id/flights', getFlightsByUser);
app.delete(
  '/api/users/:user_id/flights/:flight_id',
  removeJourneyByUserIdAndFlightId
);
app.patch(
  '/api/users/:user_id/flights/:flight_id',
  patchJourneyByUserIdAndFlightId
);

app.get(
  '/api/flights/:flightNumber/date/:departureTime',
  getFlightByNumberAndDate
);

app.post('/api/users/:user_id/flights/:flight_id', postJourneyByUserIdAndFlightId);

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
  if (err.code === '22P02' || err.code === '42703') {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: 'server error getting API' });
});

module.exports = { app };
