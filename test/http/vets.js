const { describe, it, beforeEach, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const server = require('../../app');
const { signUp, createUsers, createVets } = require('../helpers');
const logger = require('../../src/logger');

describe('/vets routes', function() {
  this.timeout(25000);

  let app;
  let mongoose;
  let user;
  let token;

  let vets;

  before(async () => {
    // Retrieve app & mongoose objects
    ({ app, mongoose } = await server.catch(err => logger.error(err)));

    // Models
    const User = mongoose.model('users');
    const Vet = mongoose.model('vets');

    // First clear database from users
    await User.remove({}).catch(err => logger.error(err));
    await Vet.remove({}).catch(err => logger.error(err));

    // Sign up new user for tests
    ({ user, token } = await signUp(app, request).catch(err => logger.error(err)));

    // Create example vets & users
    const exampleUsers = await createUsers(mongoose);
    const exampleVets = await createVets(mongoose, exampleUsers);

    user = exampleUsers[0];
    vets = exampleVets;
  });

  /**
   * GET routes
   */
  describe('## GET /vets', () => {
    // Find one by ID
    describe('# GET /vets/find_one/:id', () => {
      it('Returns 404 (Not Found) when invalid ID is provided', (done) => {
        request(app)
          .get('/vets/find_one/507f1f77bcf86cd799439011')
          .expect(404)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.be.empty;
            done();
          });
      });
      it('Returns 400 (Bad Request) when ID is missing', (done) => {
        request(app)
          .get('/vets/find_one')
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.have.property('message')
            expect(res.body.message).to.match(/id is missing/);
            done();
          });
      });
      it('Returns 400 (Bad Request) when ID has invalid format', (done) => {
        request(app)
          .get('/vets/find_one/SomeInvalidID')
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.match(/id has invalid format/);
            done();
          });
      });
      it('Returns 200 (OK) when valid ID is provided', (done) => {
        request(app)
          .get(`/vets/find_one/${vets[0]._id}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.not.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('Name');
            done();
          });
      });
    });
  });


  /**
   * POST routes
   */
  describe('## POST /vets', () => {

    describe('# POST /vets/search', () => {
      it('Returns an array when valid name or address is present', (done) => {
        const search = vets[0].Address.substring(0, vets[0].Address.indexOf(' ', 9));
        request(app)
          .post('/vets/search')
          .send({ search })
          .expect(201)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(1);
            expect(res.body[0]).to.have.property('Name');
            expect(res.body[0].Address).to.match(new RegExp(`${search}`, 'i'));
            done();
          });
      });
    });

    describe('# POST /vets/find_nearby', () => {
      it('Returns 400 when coordinates are not valid', () => {
        request(app)
          .post('/vets/find_nearby')
          .send({ range: 160, lat: 360.0000, lng: 360.0000 })
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body.results).to.not.exist;
            expect(res.body.message).to.exist;
            expect(res.body.message).to.match(/coordinates are invalid/);
          });
      });
      it('Returns 400 when coordinates are not present', () => {
        request(app)
          .post('/vets/find_nearby')
          .send({ range: 160 })
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body.results).to.not.exist;
            expect(res.body.message).to.exist;
            expect(res.body.message).to.match(/coordinates are missing/);
          });
      });
      it('Returns 400 when range is invalid', () => {
        request(app)
          .post('/vets/find_nearby')
          .send({ range: -100, lat: 46.0000, lng: 55.0000 })
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body.results).to.not.exist;
            expect(res.body.message).to.exist;
            expect(res.body.message).to.match(/range is invalid/);
          });
      });
      it('Returns 400 when range is not present', () => {
        request(app)
          .post('/vets/find_nearby')
          .send({ lat: 80.0000, lng: 16.0000 })
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body.results).to.not.exist;
            expect(res.body.message).to.exist;
            expect(res.body.message).to.match(/range is missing/);
          });
      });
      it('Returns 201 and an empty array with too short range', () => {
        const range = 1;
        const lat = 60.0000;
        const lng = 70.0000;

        request(app)
          .post('/vets/find_nearby')
          .send({ range, lat, lng })
          .expect(201)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(0);
          });
      });
      it('Returns 201 and an array of vets with valid payload', () => {
        const range = 160;
        const lat = (parseFloat(vets[0].Position[1]) + 0.001).toFixed(6);
        const lng = (parseFloat(vets[0].Position[0]) + 0.001).toFixed(6);

        request(app)
          .post('/vets/find_nearby')
          .send({ range, lat, lng })
          .expect(201)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(res.body.length);
            expect(res.body[0]).to.be.an('object');
          });
      });
    });
  });

});