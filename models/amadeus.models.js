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
    const data = await response.json();
    // console.log('🚀 ~ getFlightDetails:', data.data[0].scheduledDepartureDate);

    const { flightDesignator, flightPoints } = data.data[0];
    // console.log(flightPoints[0].iataCode);
    const { carrierCode, flightNumber } = flightDesignator;
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const airline = await getAirlineName(carrierCode, headers);

    const flightData = [
      carrierCode + flightNumber,
      flightPoints[0].iataCode,
      flightPoints[1].iataCode,
      flightPoints[0].departure.timings[0].value,
      flightPoints[1].arrival.timings[0].value,
      airline,
    ];
    // console.log('🚀 ~ getFlightDetails ~ flightData:', flightData);
    return flightData;
    // if (!airline) throw new Error('Failed to retrieve airline name');

    //   return {
    //     id: uuidv4(),
    //     flightNumber:
    //       response.data.data[0].flightDesignator.carrierCode +
    //       response.data.data[0].flightDesignator.flightNumber,
    //     departureAirport: response.data.data[0].flightPoints[0].iataCode,
    //     arrivalAirport: response.data.data[0].flightPoints[1].iataCode,
    //     departureTime:
    //       response.data.data[0].flightPoints[0].departure.timings[0].value,
    //     arrivalTime:
    //       response.data.data[0].flightPoints[1].arrival.timings[0].value,
    //     airline: airline,
    //     seats: [],
    //     preferences: {
    //       location: '',
    //       extraLegroom: false,
    //       position: '',
    //       neighbouringRows: false,
    //       sameRow: true,
    //       sideBySide: false,
    //     },
    //   };
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
