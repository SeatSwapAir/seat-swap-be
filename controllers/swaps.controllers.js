const { insertSwap } = require('../models/swaps.models');

const postSwap = async (req, res, next) => {
  const { offered_seat_id, requested_seat_id } = req.body;
  insertSwap(offered_seat_id, requested_seat_id)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};
module.exports = {
  postSwap,
};
