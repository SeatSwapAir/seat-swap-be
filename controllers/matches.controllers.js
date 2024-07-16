const { selectSideBySideMatches } = require('../models/matches.models');

const getSideBySideMatches = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  selectSideBySideMatches(user_id, flight_id)
    .then((matches) => {
      res.status(200).send({ matches });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getSideBySideMatches
};