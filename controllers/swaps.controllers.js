const {
  insertSwap,
  updateSwap,
  selectSwap,
} = require('../models/swaps.models');

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

const patchSwap = async (req, res, next) => {
  const { action } = req.body;
  const { swap_id } = req.params;
  updateSwap(action, swap_id)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};

const getSwap = async (req, res, next) => {
  const { your_seat_id, matched_seat_id } = req.params;
  selectSwap(your_seat_id, matched_seat_id)
    .then((body) => {
      res.status(200).send(body);
    })
    .catch((error) => {
      next(error);
    });
};
module.exports = {
  postSwap,
  patchSwap,
  getSwap,
};
