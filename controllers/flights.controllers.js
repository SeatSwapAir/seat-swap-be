const { selectFlightByNumberCarrierDate } = require('../models/flights.models');

const getFlightByNumberAndDate = async (req, res, next) => {
  const { flightNumber, departureTime } = req.params;

  selectFlightByNumberCarrierDate(flightNumber, departureTime)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getFlightByNumberAndDate,
};
