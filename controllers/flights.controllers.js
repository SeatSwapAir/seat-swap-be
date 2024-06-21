const {
  selectFlightsByUser
} = require("../models/flights.models");

const getFlightsByUser = async (req, res, next) => {
  const user_id = req.params.user_id;
  selectFlightsByUser(user_id).then((flights) => {
    res.status(200).send(flights);
  }).catch((error) => {
    next(error);
  });
};


module.exports = {
  getFlightsByUser
};