const { updateSeat } = require('../models/seats.models');

const patchSeat = async (req, res, next) => {
  const { seat_id } = req.params;
  console.log('🚀 ~ patchSeat ~ seat_id:', seat_id);

  updateSeat(seat_id, req.body)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

module.exports = {
  patchSeat,
};
