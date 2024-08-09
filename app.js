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
  postJourneyByUserIdAndFlightId,
  getSeat,
} = require('./controllers/users.controllers.js');

const {
  getFlightByNumberAndDate,
} = require('./controllers/flights.controllers');

const {
  getSideBySideMatches,
  getSameRowMatches,
  getNeighbouringRowsMatches,
  getAllMatches,
} = require('./controllers/matches.controllers');

const {
  postSwap,
  patchSwap,
  getSwap,
} = require('./controllers/swaps.controllers');

const { getOffers } = require('./controllers/offers.controllers');

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

app.post(
  '/api/users/:user_id/flights/:flight_id',
  postJourneyByUserIdAndFlightId
);

app.get(
  '/api/matches/side_by_side/user/:user_id/flight/:flight_id',
  getSideBySideMatches
);

app.get(
  '/api/matches/same_row/user/:user_id/flight/:flight_id',
  getSameRowMatches
);

app.get(
  '/api/matches/neighbouring_rows/user/:user_id/flight/:flight_id',
  getNeighbouringRowsMatches
);

app.get('/api/matches/all/user/:user_id/flight/:flight_id', getAllMatches);

app.post('/api/swap', postSwap);

app.patch('/api/swap/:swap_id', patchSwap);

app.get('/api/swap/yourseat/:your_seat_id/matched/:matched_seat_id', getSwap);

app.get('/api/user/:user_id/flight/:flight_id/offers', getOffers);

app.get(
  '/api/users/:user_id/flights/:flight_id/seats/:seat_letter/:seat_number',
  getSeat
);

//handle custom errors
app.use((err, req, res, next) => {
  // console.log('🚀 ~ app.use ~ err:', err);
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

//handle Database errors
app.use((err, req, res, next) => {
  // console.log('🚀 ~ app.use ~ err:', err);
  if (err.code === '22P02' || err.code === '42703') {
    res.status(400).send({ msg: 'Bad request' });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  // console.log('🚀 ~ app.use ~ err:', err);
  if (err.code === '23503') {
    res
      .status(403)
      .send({ msg: 'You swapped a seat on this flight, cannot delete' });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  // console.log(err);
  res.status(500).send({ msg: 'server error getting API' });
});

module.exports = { app };
