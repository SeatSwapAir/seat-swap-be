const {
  selectSideBySideMatches,
  selectSameRowMatches,
  selectNeighbourhingRowsMatches,
} = require('../models/matches.models');

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

const getSameRowMatches = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  selectSameRowMatches(user_id, flight_id)
    .then((same_row_matches) => {
      res.status(200).send({ same_row_matches });
    })
    .catch((error) => {
      next(error);
    });
};

const getNeighbouringRowsMatches = async (req, res, next) => {
  const { user_id, flight_id } = req.params;

  selectNeighbourhingRowsMatches(user_id, flight_id)
    .then((neighbouring_rows_matches) => {
      res.status(200).send({ neighbouring_rows_matches });
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  getSideBySideMatches,
  getSameRowMatches,
  getNeighbouringRowsMatches,
};
