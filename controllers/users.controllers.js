const {
  selectFlightsByUser,
  deleteFlightByUserIdAndFlightId,
  updateFlightByUserIdAndFlightId,
  insertFlightByUserIdAndFlightId
} = require('../models/users.models');

const getFlightsByUser = async (req, res, next) => {
  const { user_id } = req.params;

  selectFlightsByUser(user_id)
    .then((flights) => {
      console.log("🚀 ~ .then ~ flights:", flights[0].seats)
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

const patchJourneyByUserIdAndFlightId = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  updateFlightByUserIdAndFlightId(user_id, flight_id, req.body)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};


const postJourneyByUserIdAndFlightId = async (req, res, next) => {
  const { user_id, flight_id } = req.params;
  insertFlightByUserIdAndFlightId(user_id, flight_id, req.body)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};
module.exports = {
  getFlightsByUser,
  removeJourneyByUserIdAndFlightId,
  patchJourneyByUserIdAndFlightId,
  postJourneyByUserIdAndFlightId
};
