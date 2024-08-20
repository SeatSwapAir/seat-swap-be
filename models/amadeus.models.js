const db = require('../db/connection.js');
const dayjs = require('dayjs');

const getToken = async () => {
  const client_id = process.env.AMADEUS_API_KEY;
  const client_secret = process.env.AMADEUS_API_SECRET;

  const bodyParameters = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: client_id,
    client_secret: client_secret,
  });

  try {
    const response = await fetch(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParameters,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.log('error', error);
  }
};

const getFlightDetails = async (flightNumber, departureTime) => {
  const token = await getToken();
  const code = flightNumber.slice(0, 2);
  const number = flightNumber.slice(2);
  const departureDate = dayjs(departureTime).format('YYYY-MM-DD');
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v2/schedule/flights?carrierCode=${code}&flightNumber=${number}&scheduledDepartureDate=${departureDate}`,
      {
        method: 'GET',
        headers: headers,
      }
    );
    console.log('🚀 ~ getFlightDetails ~ response:', response);

    const data = await response.json();
    if (data.data?.length === 0) {
      return Promise.reject({
        status: 404,
        msg: 'Flight not found',
      });
    }
    if (
      data.errors &&
      data.errors[0].detail ===
        "Query parameter 'scheduledDepartureDate' should not be past date"
    ) {
      return Promise.reject({
        status: 400,
        msg: 'Past date entered, please enture current/future date',
      });
    }
    const { flightDesignator, flightPoints } = data.data[0];
    const { carrierCode, flightNumber } = flightDesignator;
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const carrierCodeExist = await db.query(
      `SELECT * FROM airline WHERE iata = $1;`,
      [carrierCode]
    );
    const airline =
      carrierCodeExist.rowCount > 0
        ? carrierCodeExist.rows[0].airline
        : await getAirlineName(carrierCode, headers);

    const flightData = [
      carrierCode + flightNumber,
      flightPoints[0].iataCode,
      flightPoints[1].iataCode,
      flightPoints[0].departure.timings[0].value,
      flightPoints[1].arrival.timings[0].value,
      airline,
    ];
    return flightData;
  } catch (error) {
    console.log('error', error);
  }
};

const getAirlineName = async (carrierCode, headers) => {
  try {
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/airlines?airlineCodes=${carrierCode}`,
      {
        method: 'GET',
        headers: headers,
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return data.data[0].commonName;
  } catch (error) {
    console.log('error', error);
  }
};

module.exports = {
  getToken,
  getFlightDetails,
  getAirlineName,
};
