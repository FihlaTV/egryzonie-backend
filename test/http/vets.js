const { describe, it, beforeEach, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const server = require('../../app');
const { signUp, createUsers, createVets } = require('../helpers');

describe('/vets routes', function() {
  this.timeout(25000);

  let app;
  let mongoose;
  let user;
  let token;

  let vets;

  before(async () => {
    // Retrieve app & mongoose objects
    ({ app, mongoose } = await server.catch(err => console.error(err)));

    // Models
    const User = mongoose.model('users');
    const Vet = mongoose.model('vets');

    // First clear database from users
    await User.remove({}).catch(err => console.error(err));
    await Vet.remove({}).catch(err => console.error(err));

    // Sign up new user for tests
    ({ user, token } = await signUp(app, request).catch(err => console.error(err)));

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

    // Find by address or name
    describe('# GET /vets/find', () => {
      it('Returns 400 (Bad Request) without coordinates present', (done) => {
        request(app)
          .get('/vets/find_nearby')
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.match(/Coordinates are missing/i);
            done();
          });
      });
    });

    // Find by coordinates
    describe('# GET /vets/find_nearby', () => {
      it('Returns 400 (Bad Request) when coordinates are invalid', (done) => {
        request(app)
          .get('/vets/find_nearby/200/-240.000000/666.000000')
          .expect(400)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.match(/Coordinates are invalid/i);
            done();
          });
      });

      it('Returns an array when valid coordinates are present', (done) => {
        // Why 1 ant then 0? MongoDB geospatial queries require
        // the use of reversed order - first longitude, then lattitude
        const lat = (parseFloat(vets[0].Position[1]) + 0.001).toFixed(6);
        const lng = (parseFloat(vets[0].Position[0]) + 0.001).toFixed(6);

        request(app)
          .get(`/vets/find_nearby/160/${lat}/${lng}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.exist;
            expect(res.body).to.be.an('array');
            done();
          });
      });
    });

    // Find one by ID
    describe('# GET /vets/show/:id', () => {
      it('Returns 404 (Not Found) when invalid ID is provided', (done) => {
        request(app)
          .get('/vets/show/45bz80acb2353e03567824db')
          .expect(404)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.be.empty;
          });
      });
      it('Returns 200 (OK) when valid ID is provided', (done) => {
        request(app)
          .get(`/vets/show/${vets[0]._id}`)
          .expect(200)
          .end((err, res) => {
            if (err) throw err;
            expect(res.body).to.not.be.empty;
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('Name');
          });
      });
    });
  });


  /**
   * POST routes
   */
  describe('### POST /vets', () => {
    describe('## POST /search', () => {
      it('# Returns an array when valid name or address is present', (done) => {
        const search = vets[0].Address.substring(0, vets[0].Address.indexOf(' ', 9));
        request(app)
          .post('/vets/search')
          .send({ search })
          .expect(200)
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
  });

});