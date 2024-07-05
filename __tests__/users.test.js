const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');

beforeEach(() => seed(data));
afterAll(() => db.end());

xdescribe('GET /api/users/:user_id/flights', () => {
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
            number: '8F',
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
        departuretime: '2023-06-08T06:00:00.000Z',
        arrivaltime: '2023-06-08T09:00:00.000Z',
        airline: 'American Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 129,
            location: 'front',
            number: '8F',
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
        departuretime: '2023-06-02T08:30:00.000Z',
        arrivaltime: '2023-06-02T10:30:00.000Z',
        airline: 'Delta Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 236,
            location: 'front',
            number: '8F',
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
        departuretime: '2023-06-09T08:30:00.000Z',
        arrivaltime: '2023-06-09T10:30:00.000Z',
        airline: 'Delta Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 292,
            location: 'front',
            number: '8F',
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
        departuretime: '2023-06-03T11:00:00.000Z',
        arrivaltime: '2023-06-03T13:30:00.000Z',
        airline: 'United Airlines',
        seats: [
          {
            extraLegroom: false,
            id: 311,
            location: 'front',
            number: '8F',
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

xdescribe('DELETE /api/users/:user_id/flights/:flight_id', () => {
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

xdescribe('PATCH /api/users/:user_id/flights/:flight_id', () => {
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
        extraLegroom: false,
        location: 'back',
        position: 'aisle',
      },
      {
        id: 81,
        number: '20E',
        extraLegroom: false,
        location: 'back',
        position: 'aisle',
      },
      {
        id: 82,
        number: '13D',
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
          extraLegroom: false,
          location: 'back',
          position: 'aisle',
        },
        {
          id: expect.any(Number),
          number: '20E',
          extraLegroom: false,
          location: 'back',
          position: 'aisle',
        },
        {
          id: expect.any(Number),
          number: '13D',
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

  test('404: Responds with an error message for a non-existent flight id', () => {
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

// describe('POST /api/flights', () => {
//   test('200: Returns with a flightId if it exists in local DB for a given number, carrier code, and dep date', () => {
//     return request(app)
//       .post('/api/flights')
//       .send({
//         number: '101',
//         carrier: 'AA',
//         departuredate: '2023-06-01T07:00:00Z',
//       })
//       .expect(200)
//       .then(({ body }) => {
//         expect(body).toBe('1');
//       });
//   });
// });

// describe("POST /api/users/email", () => {
//   test("should return 201 and the inserted user", () => {
//     return request(app)
//       .post("/api/users/email")
//       .send({ email: "new.user@example.com" })
//       .expect(201)
//       .then((res) => {
//         const { user } = res.body;
//         expect(user).toEqual(
//           expect.objectContaining({
//             id: expect.any(Number),
//             email: "new.user@example.com",
//           })
//         );
//       });
//   });
