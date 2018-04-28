const { describe, it, beforeEach, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const server = require('../../app');
const { signUp } = require('../helpers');


describe('/profile routes', function() {
  this.timeout(10000);

  let app;
  let mongoose;
  let user;
  let token;

  before(async () => {
    ({ app, mongoose } = await server.catch(err => console.error(err)));
    const User = mongoose.model('users');
    
    // First clear database from users
    await User.remove({});
    
    ({ user, token } = await signUp(app, request).catch(err => console.error(err)));
  });
  
  describe('GET /profile', () => {
    it('gets status 401 (Unauthorized) without valid token', (done) => {
      request(app)
        .get('/profile')
        .expect(401, done);
    });
    it('gets status 401 (Unauthorized) with invalid token', (done) => {
      request(app)
        .get('/profile')
        .set('Authorization', 'Bearer invalidToken')
        .expect(401)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.exist;
          done();
        });
    });
    it('gets status 200 (OK) when token is present', (done) => {
      request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.exist;
          expect(res.headers).to.exist;
          done();
        });
    });
  });

  describe('PUT /profile', () => {
    it('returns 204 (No content) on valid payload', (done) => {
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
        .set('Authorization', `Bearer ${token}`)
        .send(newProfile)
        .end((err, res) => {
          if (err) throw err;
          expect(res.status).to.equal(204);
          done();
        });
    });
    it('returns 400 (Bad request) on invalid payload', (done) => {
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
          if (err) throw err;
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('type');
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('GET /profile/:UserId', () => {
    it('is accessible without user logged in', (done) => {
      const User = mongoose.model('users');
      User.findOne({})
        .then((user) => {
          expect(user).to.have.property('_id');

          request(app)
            .get(`/profile/${user._id}`)
            .expect(200)
            .end((err, res) => {
              if (err) throw err;
              expect(res.body).to.have.property('UserId');
              done();
            });
        })
        .catch((err) => { throw err; });
    });
  });
});