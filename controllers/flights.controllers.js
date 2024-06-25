const { deleteFlightByUserFlightId, selectFlightsByUserFlightId } = require('../models/flights.models');

const removeFlightByUserFlightId = async (req, res, next) => {
  const { user_flight_id } = req.params;

  deleteFlightByUserFlightId(user_flight_id)
    .then((flights) => {
      res.status(204).send({ flights });
    })
    .catch((error) => {
      next(error);
    });
};

const getFlightsByUserFlightId = async (req, res, next) => {
  const { user_flight_id } = req.params;

  selectFlightsByUserFlightId(user_flight_id)
    .then((flights) => {
      res.status(200).send({ flights });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  removeFlightByUserFlightId,
  getFlightsByUserFlightId
};


