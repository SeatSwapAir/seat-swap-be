const db = require('../db/connection.js');
const pgformat = require('pg-format');
const dayjs = require('dayjs');

const {
  getToken,
  getFlightDetails,
  getAirlineName,
} = require('../models/amadeus.models');

const selectFlightByNumberCarrierDate = async (flightNumber, departureTime) => {
  function validateFlightNumber(flightNumber) {
    const regex = /^(?:[A-Z]{2}|[A-Z][0-9])\s?[0-9]{3,4}$/;
    return regex.test(flightNumber);
  }
  if (validateFlightNumber(flightNumber) === false) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid flight number',
    });
  }
  const dateValidity = dayjs(departureTime).isValid();
  if (dateValidity === false) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid date',
    });
  }
  try {
    const flightInfo = await db.query(
      `SELECT * FROM flight WHERE flightNumber= $1 AND departureTime= $2;`,
      [flightNumber, departureTime]
    );

    if (flightInfo.rowCount === 0) {
      const flightData = await getFlightDetails(flightNumber, departureTime);

      const insertFlight = await db.query(
        `INSERT INTO flight (flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, airline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        flightData
      );

      return insertFlight.rows[0];
    }
    return flightInfo.rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  selectFlightByNumberCarrierDate,
};
