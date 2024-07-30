const { app } = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index.js');
const moment = require('moment');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('POST /api/swap', () => {
  const payload = {
    requester_seat_id: 453,
    respondent_seat_id: 454,
  };
  test('200: Creates a new swap and responds with the relevant seat ids and swap request date', () => {
    const result = {
      requester_seat_id: 453,
      respondent_seat_id: 454,
      created_at: moment().format('YYYY-MM-DD HH'),
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        body.created_at = moment(body.created_at).format('YYYY-MM-DD HH');
        expect(body).toEqual(result);
      });
  });

  test('400: Responds with a bad request for posting an existing swap', () => {
    const payload = {
      requester_seat_id: 453,
      respondent_seat_id: 452,
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Swap already exists');
      });
  });
  test('400: Responds with a bad request for a non-existent offered_seat_id', () => {
    const payload = {
      requester_seat_id: 238239,
      respondent_seat_id: 452,
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
  test('400: Responds with a bad request for a non-existent requested_seat_id', () => {
    const payload = {
      requester_seat_id: 453,
      respondent_seat_id: 238239,
    };
    return request(app)
      .post('/api/swap')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
});

describe('PATCH /api/swap/:swap_id', () => {
  const payload = {
    action: 'accept',
  };
  test('200: Responds with relevant seat ids and swap approval date', () => {
    const result = {
      accepted: {
        id: 1,
        requester_id: 24,
        respondent_id: 143,
        requester_seat_id: 453,
        respondent_seat_id: 452,
        status: 'accepted',
        created_at: '2024-07-19T14:12:43.790Z',
        updated_at: moment().format('YYYY-MM-DD HH'),
      },
      voided: [
        {
          id: 2,
          requester_id: 24,
          respondent_id: 59,
          requester_seat_id: 453,
          respondent_seat_id: 455,
          status: 'voided',
          created_at: '2024-07-19T14:12:43.790Z',
          updated_at: '2024-07-19T17:12:43.790Z',
        },
        {
          id: 3,
          requester_id: 1,
          respondent_id: 24,
          requester_seat_id: 451,
          respondent_seat_id: 453,
          status: 'voided',
          created_at: '2024-07-19T14:12:43.790Z',
          updated_at: null,
        },
        {
          id: 4,
          requester_id: 97,
          respondent_id: 24,
          requester_seat_id: 450,
          respondent_seat_id: 453,
          status: 'voided',
          created_at: '2024-07-19T14:12:43.790Z',
          updated_at: '2024-07-19T17:12:43.790Z',
        },
        {
          id: 6,
          requester_id: 24,
          respondent_id: 89,
          requester_seat_id: 374,
          respondent_seat_id: 367,
          status: 'voided',
          created_at: '2024-07-19T14:12:43.790Z',
          updated_at: '2024-07-19T18:12:43.790Z',
        },
      ],
    };
    return request(app)
      .patch('/api/swap/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        body.accepted.updated_at = moment(body.accepted.updated_at).format(
          'YYYY-MM-DD HH'
        );
        expect(body).toEqual(result);
      });
  });
  test('400: Responds with a bad request for updating a non existent swap', () => {
    const payload = {
      action: 'accept',
    };
    return request(app)
      .patch('/api/swap/34543')
      .send(payload)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Swap does not exist');
      });
  });
  test('200: Responds with relevant seat ids and swap rejected status true', () => {
    const payload = {
      action: 'reject',
    };
    const result = {
      requester_seat_id: 453,
      respondent_seat_id: 452,
      status: 'rejected',
    };
    return request(app)
      .patch('/api/swap/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });
  test('200: Responds with relevant seat ids and cancelled status true', () => {
    const payload = {
      action: 'cancel',
    };
    const result = {
      requester_seat_id: 453,
      respondent_seat_id: 452,
      status: 'cancelled',
    };
    return request(app)
      .patch('/api/swap/1')
      .send(payload)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });
});

describe('GET /api/swap/yourseat/:your_seat_id/matched/:matched_seat_id', () => {
  test('200: Responds with request action if no swaps found for provided seat ids', () => {
    const result = {
      actions: ['request'],
    };
    return request(app)
      .get('/api/swap/yourseat/24/matched/42')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });
  test('200: Responds with request action if swap found for provided seat ids but status is cancelled', () => {
    const result = {
      actions: ['request'],
    };
    return request(app)
      .get('/api/swap/yourseat/374/matched/367')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });
  test('200: Responds with action accepted if swap found for provided seat ids but status is accepted', () => {
    const result = {
      actions: ['accepted'],
    };
    return request(app)
      .get('/api/swap/yourseat/374/matched/367')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });
  test('200: Responds with accept and reject actions if swap found and matched_seat_id is requester_seat_id', () => {
    const result = {
      actions: ['accept', 'reject'],
      swap_id: 1,
    };
    return request(app)
      .get('/api/swap/yourseat/452/matched/453')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(result);
      });
  });
  test('200: Responds with cancel action if swap found and requested by your_seat_id', () => {
    const result = {
      actions: ['cancel'],
      swap_id: 1,
    };
    return request(app)
      .get('/api/swap/yourseat/453/matched/452')
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(result);
      });
  });
  test('400: Responds with a bad request for a non-existent your_seat_id', () => {
    return request(app)
      .get('/api/swap/yourseat/345345/matched/452')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
  test('400: Responds with a bad request for a non-existent matched_seat_id', () => {
    return request(app)
      .get('/api/swap/yourseat/453/matched/90984')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Seat id not found');
      });
  });
});

// api/swap/ (POST with payload of {offered_seat_id and requested_seat_id} returning same ids)
// api/swap/:id (GET Returns the swap and status (either rejected or approval date or))
// api/swap/:id/approve
// api/swap/:id/reject (PATCH for the swap id changing rejected to TRUE, in model: check if swap hasn't already been approv)

// if someone tries to cancel but both dates are not null, shouldn't allow
// if someone tries to reject but both dates are not null, shouldn't allow
