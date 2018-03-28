const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const server = require('../../app');

describe('/auth routes', () => {
  let app;
  let testUser;
  before(function(done) {
    this.timeout(5000);
    server.then((response) => {
      app = response.app;
      response.mongoose.connection.db.dropDatabase()
        .then((_) => done());
    });
    testUser = {
      nickname: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    };
  });

  describe('POST /auth/signup', (done) => {
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

  describe('POST /auth/signin', (done) => {
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