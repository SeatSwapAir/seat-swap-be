const db = require('../db/connection.js');
const dayjs = require('dayjs');

const { getFlightDetails } = require('../models/amadeus.models');

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
    const sql = `SELECT 
        flight.*,
        dep_airport.name AS departureairportname,
        dep_airport.city AS departureairportcity,
        arr_airport.name AS arrivalairportname,
        arr_airport.city AS arrivalairportcity
        FROM flight 
        LEFT JOIN airport AS dep_airport ON flight.departureAirport = dep_airport.iata
        LEFT JOIN airport AS arr_airport ON flight.arrivalAirport = arr_airport.iata
        WHERE flightNumber = $1 AND DATE(departureTime) = $2;`;
    const flightInfo = await db.query(sql, [flightNumber, departureTime]);

    if (flightInfo.rowCount === 0) {
      const flightData = await getFlightDetails(flightNumber, departureTime);

      await db.query(
        `INSERT INTO flight (flightNumber, departureAirport, arrivalAirport, departureTime, arrivalTime, airline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        flightData
      );
      const flightInfo = await db.query(sql, [flightNumber, departureTime]);
      return flightInfo.rows[0];
    }
    return flightInfo.rows[0];
  } catch (err) {
      throw err;
  }
};

module.exports = {
  selectFlightByNumberCarrierDate,
};
