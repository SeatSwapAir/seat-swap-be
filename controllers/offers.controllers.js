const { selectOffers } = require('../models/offers.models');

const getOffers = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  selectOffers(user_id, flight_id)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getOffers,
};
