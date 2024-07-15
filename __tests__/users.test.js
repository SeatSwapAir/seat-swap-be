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
              legroom_pref: expect.any(Boolean),
              window_pref: expect.any(Boolean),
              middle_pref: expect.any(Boolean),
              aisle_pref: expect.any(Boolean),
              front_pref: expect.any(Boolean),
              center_pref: expect.any(Boolean),
              back_pref: expect.any(Boolean),
              neighbouring_row_pref: expect.any(Boolean),
              same_row_pref: expect.any(Boolean),
              side_by_side_pref: expect.any(Boolean),
            }),
          });

          flight.seats.forEach((seat) => {
            expect(seat).toMatchObject({
              number: expect.any(String),
              seat_letter: expect.any(String),
              seat_row: expect.any(Number),
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
        departuretime: '2023-06-01T07:00:00Z',
        arrivaltime: '2023-06-01T10:00:00Z',
        airline: 'American Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 2,
            location: 'front',
            number: '8F',
            seat_letter: 'F',
            seat_row: 8,
            position: 'window',
          },
        ],
        preferences: {
          legroom_pref: true,
          window_pref: false,
          middle_pref: true,
          aisle_pref: false,
          front_pref: false,
          center_pref: false,
          back_pref: false,
          neighbouring_row_pref: true,
          same_row_pref: false,
          side_by_side_pref: false,
        },
      },
      {
        id: 2,
        flightnumber: 'AA101',
        departureairport: 'JFK',
        arrivalairport: 'LAX',
        departuretime: '2023-06-08T07:00:00Z',
        arrivaltime: '2023-06-08T10:00:00Z',
        airline: 'American Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 129,
            location: 'front',
            number: '8F',
            seat_letter: 'F',
            seat_row: 8,
            position: 'window',
          },
        ],
        preferences: {
          legroom_pref: true,
          window_pref: false,
          middle_pref: true,
          aisle_pref: false,
          front_pref: false,
          center_pref: false,
          back_pref: false,
          neighbouring_row_pref: true,
          same_row_pref: true,
          side_by_side_pref: false,
        },
      },
      {
        id: 3,
        flightnumber: 'DL202',
        departureairport: 'ATL',
        arrivalairport: 'ORD',
        departuretime: '2023-06-02T09:30:00Z',
        arrivaltime: '2023-06-02T11:30:00Z',
        airline: 'Delta Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 236,
            location: 'front',
            number: '8F',
            seat_letter: 'F',
            seat_row: 8,
            position: 'window',
          },
        ],
        preferences: {
          legroom_pref: false,
          window_pref: false,
          middle_pref: true,
          aisle_pref: false,
          front_pref: false,
          center_pref: false,
          back_pref: true,
          neighbouring_row_pref: true,
          same_row_pref: false,
          side_by_side_pref: true,
        },
      },
      {
        id: 4,
        flightnumber: 'DL202',
        departureairport: 'ATL',
        arrivalairport: 'ORD',
        departuretime: '2023-06-09T09:30:00Z',
        arrivaltime: '2023-06-09T11:30:00Z',
        airline: 'Delta Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 292,
            location: 'front',
            number: '8F',
            seat_letter: 'F',
            seat_row: 8,
            position: 'window',
          },
        ],
        preferences: {
          legroom_pref: true,
          window_pref: true,
          middle_pref: false,
          aisle_pref: false,
          front_pref: false,
          center_pref: false,
          back_pref: true,
          neighbouring_row_pref: false,
          same_row_pref: false,
          side_by_side_pref: false,
        },
      },
      {
        id: 5,
        flightnumber: 'UA303',
        departureairport: 'SFO',
        arrivalairport: 'DEN',
        departuretime: '2023-06-03T12:00:00Z',
        arrivaltime: '2023-06-03T14:30:00Z',
        airline: 'United Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 311,
            location: 'front',
            number: '8F',
            seat_letter: 'F',
            seat_row: 8,
            position: 'window',
          },
        ],
        preferences: {
          legroom_pref: true,
          window_pref: true,
          middle_pref: false,
          aisle_pref: false,
          front_pref: true,
          center_pref: true,
          back_pref: true,
          neighbouring_row_pref: true,
          same_row_pref: true,
          side_by_side_pref: false,
        },
      },
      {
        id: 8,
        flightnumber: 'FR9336',
        departureairport: 'BRS',
        arrivalairport: 'GRO',
        departuretime: '2024-08-25T21:40+01:00',
        arrivaltime: '2024-08-26T00:40+02:00',
        airline: 'RYANAIR',
        seats: [
          {
            extraLegroom: false,
            id: 424,
            location: 'center',
            number: '18E',
            seat_letter: 'E',
            seat_row: 18,
            position: 'middle',
          },
          {
            extraLegroom: false,
            id: 483,
            location: 'back',
            number: '28D',
            seat_letter: 'D',
            seat_row: 28,
            position: 'aisle',
          }
        ],
        preferences: {
          legroom_pref: false,
          window_pref: false,
          middle_pref: false,
          aisle_pref: false,
          front_pref: false,
          center_pref: false,
          back_pref: false,
          neighbouring_row_pref: false,
          same_row_pref: false,
          side_by_side_pref: false,
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
      .get('/api/users/146/flights')
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

describe('PATCH /api/users/:user_id/flights/:flight_id', () => {
  const payload = {
    id: 1,
    flightnumber: 'AA101',
    departureairport: 'JFK',
    arrivalairport: 'LAX',
    departuretime: '2023-06-01T06:00:00.000Z',
    arrivaltime: '2023-06-01T09:00:00.000Z',
    airline: 'American Airlines',
    seats: [
      {
        id: 80,
        number: '12F',
        seat_letter: 'F',
        seat_row: 12,
        extraLegroom: false,
        location: 'back',
        position: 'aisle',
      },
      {
        id: 81,
        number: '20E',
        seat_letter: 'E',
        seat_row: 20,
        extraLegroom: false,
        location: 'back',
        position: 'aisle',
      },
      {
        id: 82,
        number: '13D',
        seat_letter: 'D',
        seat_row: 13,
        extraLegroom: true,
        location: 'front',
        position: 'window',
      },
    ],
    preferences: {
      legroom_pref: false,
      window_pref: true,
      middle_pref: true,
      aisle_pref: false,
      front_pref: true,
      center_pref: true,
      back_pref: false,
      side_by_side_pref: false,
      neighbouring_row_pref: true,
      same_row_pref: false,
    },
  };
  test('200: Updates the user seats and preferences and responds with the updated flight object', () => {
    const result = {
      id: 1,
      flightnumber: 'AA101',
      departureairport: 'JFK',
      arrivalairport: 'LAX',
      departuretime: '2023-06-01T06:00:00.000Z',
      arrivaltime: '2023-06-01T09:00:00.000Z',
      airline: 'American Airlines',
      seats: [
        {
          id: expect.any(Number),
          number: '12F',
          seat_letter: 'F',
          seat_row: 12,
          extraLegroom: false,
          location: 'back',
          position: 'aisle',
        },
        {
          id: expect.any(Number),
          number: '20E',
          seat_letter: 'E',
          seat_row: 20,
          extraLegroom: false,
          location: 'back',
          position: 'aisle',
        },
        {
          id: expect.any(Number),
          number: '13D',
          seat_letter: 'D',
          seat_row: 13,
          extraLegroom: true,
          location: 'front',
          position: 'window',
        },
      ],
      preferences: {
        legroom_pref: false,
        window_pref: true,
        middle_pref: true,
        aisle_pref: false,
        front_pref: true,
        center_pref: true,
        back_pref: false,
        side_by_side_pref: false,
        neighbouring_row_pref: true,
        same_row_pref: false,
      },
    };
    return request(app)
      .patch('/api/users/77/flights/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });

  test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .patch('/api/users/invalid_id/flights/1')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('400: Responds with a bad request error for an invalid flight id', () => {
    return request(app)
      .patch('/api/users/77/flights/invalid_id')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .patch('/api/users/2147483647/flights/1')
      .send(payload)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a non-existent flight id', () => {
    return request(app)
      .patch('/api/users/77/flights/2147483647')
      .send(payload)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });

  test('404: Responds with an error message if a seat is already taken', () => {
    const extraSeat = {
      id: 327,
      number: '24B',
      extraLegroom: true,
      location: 'back',
      position: 'aisle',
    };
    const newPayload = { ...payload, seats: [...payload.seats, extraSeat] };
    return request(app)
      .patch('/api/users/77/flights/1')
      .send(newPayload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat(s) already taken by another passenger');
      });
  });
});

describe('POST /api/users/:user_id/flights/:flight_id', () => {
  const payload = {
    id: 2,
    flightnumber: 'AA101',
    departureairport: 'JFK',
    arrivalairport: 'LAX',
    departuretime: '2023-06-08T07:00:00Z',
    arrivaltime: '2023-06-08T10:00:00Z',
    airline: 'American Airlines',
    seats: [
      {
        id: 80,
        number: '12G',
        seat_letter: 'G',
        seat_row: 12,
        extraLegroom: false,
        location: 'back',
        position: 'aisle',
      },
      {
        id: 81,
        number: '20G',
        seat_letter: 'G',
        seat_row: 20,
        extraLegroom: false,
        location: 'back',
        position: 'aisle',
      }],
    preferences: {
      legroom_pref: false,
      window_pref: true,
      middle_pref: true,
      aisle_pref: false,
      front_pref: true,
      center_pref: true,
      back_pref: false,
      side_by_side_pref: false,
      neighbouring_row_pref: true,
      same_row_pref: false,
    },
  };
  test('200: Creates a new journey and responds with the created journey object', () => {
    const result = {
      id: 2,
      flightnumber: 'AA101',
      departureairport: 'JFK',
      arrivalairport: 'LAX',
      departuretime: '2023-06-08T07:00:00Z',
      arrivaltime: '2023-06-08T10:00:00Z',
      airline: 'American Airlines',
      seats: [
        {
          id: expect.any(Number),
          number: '12G',
          seat_letter: 'G',
          seat_row: 12,
          seat_column: 7,
          extraLegroom: false,
          location: 'back',
          position: 'aisle',
        },
        {
          id: expect.any(Number),
          number: '20G',
          seat_letter: 'G',
          seat_row: 20,
          seat_column: 7,
          extraLegroom: false,
          location: 'back',
          position: 'aisle',
        }],
      preferences: {
        legroom_pref: false,
        window_pref: true,
        middle_pref: true,
        aisle_pref: false,
        front_pref: true,
        center_pref: true,
        back_pref: false,
        side_by_side_pref: false,
        neighbouring_row_pref: true,
        same_row_pref: false,
      },
    };
    return request(app)
      .post('/api/users/77/flights/2')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
    test('400: Responds with a bad request error for an invalid user id', () => {
    return request(app)
      .patch('/api/users/invalid_id/flights/1')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('400: Responds with a bad request error for an invalid flight id', () => {
    return request(app)
      .patch('/api/users/77/flights/invalid_id')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request');
      });
  });

  test('404: Responds with an error message for a non-existent user id', () => {
    return request(app)
      .patch('/api/users/2147483647/flights/1')
      .send(payload)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('User not found');
      });
  });

  test('404: Responds with an error message for a non-existent flight id', () => {
    return request(app)
      .patch('/api/users/77/flights/2147483647')
      .send(payload)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Flight not found');
      });
  });

  test('404: Responds with an error message if a seat is already taken', () => {
    const extraSeat = {
      id: 327,
      number: '24B',
      extraLegroom: true,
      location: 'back',
      position: 'aisle',
    };
    const newPayload = { ...payload, seats: [...payload.seats, extraSeat] };
    return request(app)
      .patch('/api/users/77/flights/1')
      .send(newPayload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat(s) already taken by another passenger');
      });
  });
});