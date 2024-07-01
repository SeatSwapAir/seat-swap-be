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

  test('200: Responds with array of flight objects that exactly match those for a user id', () => {
    const expected = [
      {
        id: 1,
        flightnumber: 'AA101',
        departureairport: 'JFK',
        arrivalairport: 'LAX',
        departuretime: '2023-06-01T06:00:00.000Z',
        arrivaltime: '2023-06-01T09:00:00.000Z',
        airline: 'American Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 2,
            location: 'front',
            number: '14B',
            position: 'window',
          },
        ],
        preferences: {
          location: 'front',
          extraLegroom: true,
          position: 'window',
          neighbouringRows: true,
          sameRow: false,
          sideBySide: false,
        },
      },
      {
        id: 2,
        flightnumber: 'AA101',
        departureairport: 'JFK',
        arrivalairport: 'LAX',
        departuretime: '2023-06-08T06:00:00.000Z',
        arrivaltime: '2023-06-08T09:00:00.000Z',
        airline: 'American Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 129,
            location: 'front',
            number: '14B',
            position: 'window',
          },
        ],
        preferences: {
          location: 'front',
          extraLegroom: true,
          position: 'window',
          neighbouringRows: true,
          sameRow: true,
          sideBySide: false,
        },
      },
      {
        id: 3,
        flightnumber: 'DL202',
        departureairport: 'ATL',
        arrivalairport: 'ORD',
        departuretime: '2023-06-02T08:30:00.000Z',
        arrivaltime: '2023-06-02T10:30:00.000Z',
        airline: 'Delta Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 236,
            location: 'front',
            number: '14B',
            position: 'window',
          },
        ],
        preferences: {
          location: 'front',
          extraLegroom: false,
          position: 'window',
          neighbouringRows: true,
          sameRow: false,
          sideBySide: true,
        },
      },
      {
        id: 4,
        flightnumber: 'DL202',
        departureairport: 'ATL',
        arrivalairport: 'ORD',
        departuretime: '2023-06-09T08:30:00.000Z',
        arrivaltime: '2023-06-09T10:30:00.000Z',
        airline: 'Delta Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 292,
            location: 'front',
            number: '14B',
            position: 'window',
          },
        ],
        preferences: {
          location: 'front',
          extraLegroom: true,
          position: 'window',
          neighbouringRows: false,
          sameRow: false,
          sideBySide: false,
        },
      },
      {
        id: 5,
        flightnumber: 'UA303',
        departureairport: 'SFO',
        arrivalairport: 'DEN',
        departuretime: '2023-06-03T11:00:00.000Z',
        arrivaltime: '2023-06-03T13:30:00.000Z',
        airline: 'United Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 311,
            location: 'front',
            number: '14B',
            position: 'window',
          },
        ],
        preferences: {
          location: 'front',
          extraLegroom: true,
          position: 'window',
          neighbouringRows: true,
          sameRow: true,
          sideBySide: false,
        },
      },
    ];
    return request(app)
      .get('/api/users/2/flights')
      .expect(200)
      .then(({ body }) => {
        const { flights } = body;
        expect(flights).toStrictEqual(expected);
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
      .get('/api/users/100/flights')
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

describe('DELETE /api/users/:user_id/flights/:flight_id', () => {
  test('204: Successfully deletes a flight by user_flight_id', () => {
    return request(app).delete('/api/users/2/flights/1').expect(204);
  });

  test('404: Responds with an error message for a non-existent flight_id', () => {
    return request(app)
      .delete('/api/users/2/flights/2147483647')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User journey not found');
      });
  });

  test('404: Responds with an error message for a non-existent user_id', () => {
    return request(app)
      .delete('/api/users/2147483647/flights/1')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User journey not found');
      });
  });

  test('400: Responds with a bad request error for an invalid flight_id', () => {
    return request(app)
      .delete('/api/users/2/flights/invalid-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('400: Responds with a bad request error for an invalid user_id', () => {
    return request(app)
      .delete('/api/users/invalid-id/flights/1')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });
});
