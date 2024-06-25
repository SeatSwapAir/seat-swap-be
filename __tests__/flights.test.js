const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('GET /api/users/:user_id/flights', () => {
  test('200: Responds with array of flight objects for a user id', () => {
    return request(app)
      .get('/api/users/2/flights')
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
            });
          });
        });
      });
  });

  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .get('/api/users/2147483647/flights')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a user with no flights', () => {
    return request(app)
      .get('/api/users/35/flights')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No flights found for user');
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .get('/api/users/invalid-id/flights')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});

describe('DELETE /api/flights/:user_flight_id', () => {
  test('204: Successfully deletes a flight by user_flight_id', () => {
    return request(app)
      .delete('/api/flights/1') 
      .expect(204)
      .then(() => {
        return request(app)
          .get('/api/flights/1')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe('Flight not found');
          });
      });
  });

  test('404: Responds with an error message for a non-existent user_flight_id', () => {
    return request(app)
      .delete('/api/flights/2147483647')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Users flight not found');
      });
  });

  test('400: Responds with a bad request error for an invalid user_flight_id', () => {
    return request(app)
      .delete('/api/flights/invalid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});
