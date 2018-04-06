const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const server = require('../../app');

describe('/auth routes', function () {
  this.timeout(5000);
  
  let app;
  const testUser = {
    nickname: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
  before(async () => {
    ({ app } = await server.catch(err => console.error(err)));
  });

  describe('POST /auth/signup', () => {
    it('returns 201 (Created) and returns jwt token on valid payload', (done) => {
      request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err, res) => {
          expect(res.body.jwtToken).to.exist;
          done();
        });
    });
    it('returns 401 (Unauthorized) on invalid payload', (done) => {
      const invalidPayload = {
        nickname: 'invalid#nickname',
        email: 'invalid#email@test.com',
        password: '12'
      };
      request(app)
        .post('/auth/signup')
        .send(invalidPayload)
        .expect(400)
        .end((err, res) => {
          expect(res.body.jwtToken).to.not.exist;
          done();
        });
    });
  });

  describe('POST /auth/signin', () => {
    it('returns 201 (Created) and jwt token on valid payload', (done) => {
      request(app)
        .post('/auth/signin')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .end((err, res) => {
          expect(res.body.jwtToken).to.exist;
          done();
        });
    });
    it('returns 400 (Unauthorized) when user does not exist', (done) => {
      request(app)
        .post('/auth/signin')
        .send({ email: 'this.email@does.notexist', password: '1234321' })
        .expect(400)
        .end((err, res) => {
          expect(res.body.jwtToken).to.not.exist;
          done();
        });
    })
  });
});