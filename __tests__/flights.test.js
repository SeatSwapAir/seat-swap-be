const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/flights/:user_id', () => {
  test('200: Responds with array of flight objects for a user id', () => {
    return request(app)
      .get('/api/flights/2')
      .expect(200)
      .then(({ body }) => {
        const { flights } = body;
        
        flights.forEach((flight) => {
          expect(flight).toMatchObject({
            id: expect.any(Number),
            flightnumber: expect.any(String),
            departureairport: expect.any(String),
            arrivalairport: expect.any(String),
            departuretime: expect.any(String),
            arrivaltime: expect.any(String),
            airline: expect.any(String),
            seats: expect.any(Array),
            preferences: expect.objectContaining({
              location: expect.any(String),
              extraLegroom: expect.any(Boolean),
              position: expect.any(String),
              neighbouringRows: expect.any(Boolean),
              sameRow: expect.any(Boolean),
              sideBySide: expect.any(Boolean),
            }),
          });

          flight.seats.forEach((seat) => {
            expect(seat).toMatchObject({
              number: expect.any(String),
              location: expect.any(String),
              extraLegroom: expect.any(Boolean),
              position: expect.any(String),
              id: expect.any(Number),
              isEditing: expect.any(Boolean),
            });
          });
        });
      });
  });

  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .get('/api/flights/2147483647')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a user with no flights', () => {
    return request(app)
      .get('/api/flights/35')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No flights found for user');
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .get('/api/flights/invalid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});
