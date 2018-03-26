const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const server = require('../../app');
const login = require('../login');

describe('/profile routes', () => {
  let app;
  let token;
  before(function(done) {
    this.timeout(5000);
    server.then((startedApp) => {
      app = startedApp;
      login(request, app)
        .then(jwtToken => {
          token = jwtToken;
          done();
        });
    });
  });
  
  describe('GET /profile', () => {
    it('gets status 404 when not signed in', (done) => {
      request(app)
        .get('/profile')
        .expect(401, done);
    });

    it('gets status 200', (done) => {
      request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200, done);
    });
  });
});