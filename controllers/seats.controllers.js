const { updateSeat, deleteSeat } = require('../models/seats.models');

const patchSeat = async (req, res, next) => {
  const { seat_id } = req.params;

  updateSeat(seat_id, req.body)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

const removeSeat = async (req, res, next) => {
  const { seat_id } = req.params;

  deleteSeat(seat_id, req.body)
    .then((body) => {
      res.status(204).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  patchSeat,
  removeSeat,
};
