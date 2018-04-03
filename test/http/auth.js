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
    app = await server.catch(err => console.error(err));
  });

  describe('POST /auth/signup', () => {
    it('can sign up new user', (done) => {
      request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(201)
        .end((err, res) => {
          expect(res.body.jwtToken).to.exist;
          done();
        });
    });
  });

  describe('POST /auth/signin', () => {
    it('can sing in created user', (done) => {
      request(app)
        .post('/auth/signin')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .end((err, res) => {
          expect(res.body.jwtToken).to.exist;
          done();
        });
    });
  });
});