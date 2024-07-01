const { selectFlightsByUser, 
  deleteFlightByUserIdAndFlightId } = require('../models/users.models');

const getFlightsByUser = async (req, res, next) => {
  const { user_id } = req.params;

  selectFlightsByUser(user_id)
    .then((flights) => {
      res.status(200).send({ flights });
    })
    .catch((error) => {
      next(error);
    });
};

const removeJourneyByUserIdAndFlightId = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  deleteFlightByUserIdAndFlightId(user_id, flight_id)
    .then((body) => {
      res.status(204).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getFlightsByUser,
  removeJourneyByUserIdAndFlightId,
};

