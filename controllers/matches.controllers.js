const { selectSideBySideMatches } = require('../models/matches.models');

const getSideBySideMatches = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  selectSideBySideMatches(user_id, flight_id)
    .then((side_by_side_matches) => {
      res.status(200).send({ side_by_side_matches });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getSideBySideMatches,
};
