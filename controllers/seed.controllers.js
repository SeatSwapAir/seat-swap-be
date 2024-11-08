
const getSeed = async (req, res, next) => {
const devData = require('../db/data/development-data/index.js');
const seed = require('../db/seeds/seed.js');

seed(devData).then(() => {
      res.status(200).send({ message: 'Seeding complete' });
    })
    .catch((error) => {
      res.status(500).send({ message: 'BOOYAKASHA! ' });
      next(error);
    });
};

module.exports = {
  getSeed,
};
