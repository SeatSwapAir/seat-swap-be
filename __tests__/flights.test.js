const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/flights/:flightNumber/date/:departureTime', () => {
  test('200: Responds with a with a flightId if it exists in local DB for a given flightNumber and departureTime', () => {
    return request(app)
      .get('/api/flights/AA101/date/2023-06-01T07:00:00Z')
      .expect(200)
      .then(({ body }) => {
        // console.log('🚀 ~ .then ~ body:', body);

        expect(body).toMatchObject({
          id: 1,
          flightnumber: 'AA101',
          departureairport: 'JFK',
          arrivalairport: 'LAX',
          departuretime: '2023-06-01T07:00:00Z',
          arrivaltime: '2023-06-01T10:00:00Z',
          airline: 'American Airlines',
        });
      });
  });
  test('200: Responds with a flightId if it does not exist in local DB but has created flight with Amadeus API response', () => {
    return request(app)
      .get('/api/flights/Z0701/date/2024-07-19T07:00:00Z')
      .expect(200)
      .then(({ body }) => {
        expect(body.id).toBe(6);
      });
  });
});
// if the
