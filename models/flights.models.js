const db = require('../db/connection.js');
const pgformat = require('pg-format');

const {
  getToken,
  getFlightDetails,
  getAirlineName,
} = require('../models/amadeus.models');

const selectFlightByNumberCarrierDate = async (flightNumber, departureTime) => {
  try {
    const flightId = await db.query(
      `SELECT * FROM flight WHERE flightNumber= $1 AND departureTime= $2;`,
      [flightNumber, departureTime]
    );
    console.log(
      '🚀 ~ selectFlightByNumberCarrierDate ~ flightId:',
      flightId.rows[0]
    );

    if (flightId.rowCount === 0) {
      const flightData = await getFlightDetails(flightNumber, departureTime);
      console.log(
        '🚀 ~ selectFlightByNumberCarrierDate ~ flightData:',
        flightData
      );

      const insertFlight = await db.query(
        `INSERT INTO flight (flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, airline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        flightData
      );
      console.log(
        '🚀 ~ selectFlightByNumberCarrierDate ~ insertFlight:',
        insertFlight.rows[0]
      );

      const flightId = await db.query(`SELECT id FROM flight WHERE id=$1;`, [
        insertFlight.rows[0].id,
      ]);

      return flightId.rows[0];
    }
    return flightId.rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  selectFlightByNumberCarrierDate,
};
