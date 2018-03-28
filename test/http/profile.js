const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
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
    it('gets status 401 without valid token', (done) => {
      request(app)
        .get('/profile')
        .expect(401, done);
    });
    it('gets status 401 with invalid token', (done) => {
      request(app)
        .get('/profile')
        .expect(401, done);
    });
    it('gets status 200 when token is present', (done) => {
      request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200, done);
    });
  });

  describe('PUT /profile', () => {
    it('can update Profile', (done) => {
      const newProfile = {
        FullName: faker.name.firstName() + ' ' + faker.name.lastName(),
        PublicEmail: faker.internet.email(),
        FacebookURL: 'https://www.facebook.com/' + faker.internet.userName(),
        TwitterURL: 'https://www.twitter.com/' + faker.internet.userName(),
        InstagramURL: 'https://www.instagram.com/' + faker.internet.userName(),
        YouTubeURL: 'https://www.youtube.com/user/' + faker.internet.userName(),
        IsOrganization: (Math.random() > 0.5 ? 'on' : 'off') // checkbox value
      };
      request(app)
        .put('/profile')
        .send(newProfile)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          expect(res.body.FullName).to.equal(newProfile.FullName);
          expect(res.body.PublicEmail).to.equal(newProfile.PublicEmail);
          expect(res.body.FacebookURL).to.equal(newProfile.FacebookURL);
          expect(res.body.TwitterURL).to.equal(newProfile.TwitterURL);
          expect(res.body.InstagramURL).to.equal(newProfile.InstagramURL);
          expect(res.body.YouTubeURL).to.equal(newProfile.YouTubeURL);
          expect(res.body.IsOrganization).to.equal(newProfile.IsOrganization === 'on' ? true : false);
          done();
        });
    });
    it('will not update Profile when data is invalid', (done) => {
      const newProfile = {
        FullName: 'Some Random Username',
        PublicEmail: 'some#invalid@emaill.com',
        FacebookURL: 'https://www.twitter.com/' + faker.internet.userName(),
        TwitterURL: 'https://www.facebook.com/' + faker.internet.userName(),
        InstagramURL: 'https://www.youtube.com/user' + faker.internet.userName(),
        YouTubeURL: 'https://www.instagram.com/' + faker.internet.userName(),
        IsOrganization: (Math.random() > 0.5 ? true : false)
      };
      request(app)
        .put('/profile')
        .send(newProfile)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          done();
        });
    });
  });
});