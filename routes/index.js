const apiRouter = require('express').Router();
const flightsRouter = require('./flights.routes');

const endpoints = require('../endpoints.json');

apiRouter.get('/', (req, res) => {
  res.status(200).send({ endpoints });
});

apiRouter.use('/users/:user_id/flights', flightsRouter);
apiRouter.use('/flights/:user_flights_id', flightsRouter);


apiRouter.use((req, res) => {
  console.log('🚀 ~ apiRouter.use ~ req:', req.params);
  res.status(404).send({ msg: 'Not found' });
});

module.exports = apiRouter;
