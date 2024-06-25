const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const { removeFlightByUserFlightId, getFlightsByUserFlightId } = require('./controllers/flights.controllers.js');
const { getFlightsByUser,  } = require('./controllers/users.controllers.js');

app.get('/api/users/:user_id/flights', getFlightsByUser);
app.delete('/api/flights/:user_flight_id',removeFlightByUserFlightId );
app.get('/api/flights/:user_flight_id',getFlightsByUserFlightId );

const apiRouter = require('./routes');
// router
app.use('/api', apiRouter);

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
