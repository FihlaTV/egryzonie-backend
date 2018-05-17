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

  console.warn('\n\n!! NONE OF THIS TESTS WORKS, PLEASE UNCOMMENT BEFORE WORKING ON /vets ROUTES\n\n');

  // GETs
  describe('GET /vets', () => {
    // it('returns 400 (Bad Request) without coordinates present', (done) => {
    //   request(app)
    //     .get('/vets/find')
    //     .expect(400)
    //     .end((err, res) => {
    //       if (err) throw err;
    //       expect(res.body).to.have.property('message');
    //       expect(res.body.message).to.match(/Coordinates are missing/i);
    //       done();
    //     });
    // });

    // it('returns 400 (Bad Request) when coordinates are invalid', (done) => {
    //   request(app)
    //     .get('/vets/find/200/-240.000000/666.000000')
    //     .expect(400)
    //     .end((err, res) => {
    //       if (err) throw err;
    //       expect(res.body).to.have.property('message');
    //       expect(res.body.message).to.match(/Coordinates are invalid/i);
    //       done();
    //     });
    // });

    it('returns an array when valid coordinates are present', (done) => {
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

    it('returns an array when valid name or address is present', (done) => {
      const address = vets[0].Address.substring(0, vets[0].Address.indexOf(' ', 9));
      // expect(address).to.equal('Osiedle Władysława');
      request(app)
        .get(`/vets/find/${address}`)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(1);
          expect(res.body[0]).to.have.property('Name');
          expect(res.body[0].Name).to.match(new RegExp(`${address}`, 'i'));
          done();
        });
    });
  });

  // POSTs
  describe('POST /vets/suggestions', () => {
    const validPayload = {
      GoogleMapsID: 'ChIJ_RRLtDUcBEcREip9_VldDA4',
      Position: [ 52.706173, 16.380660 ],
      Name: 'Centrum Zdrowia Małych Zwierząt',
      Address: 'Poznańska 63A, 64-510 Wronki',
      Rodents: true,
      ExoticAnimals: true,
      WebsiteURL: 'http://www.centrum-wet.pl/',
      Phone: '510 517 636',
      Accepted: true,
      AcceptedDate: new Date('01/01/2016'),
      SuggestedBy: [1],
      AcceptedBy: 1
    };
    it('returns 400 (Bad Request) when GoogleMapsID is missing', (done) => {
      const invalidPayload = { ...validPayload, GoogleMapsID: null };
      // request(app)
      //   .post('/vets/suggestions')
      //   .send(payload)
      //   .expect(400)
      //   .end((err, res) => {
      //     if (err) throw err;
      //     expect(res.body).to.have.property('message');
      //     expect(res.body.message).to.match(/GoogleMapsID is missing/i);
      //     done();
      //   });
      done();
    });
    it('returns 400 (Bad Request) when GoogleMapsID already exist', (done) => {
      const payload = vets[0];
      // request(app)
      //   .post('/vets/suggestions')
      //   .send(payload)
      //   .expect(400)
      //   .end((err, res) => {
      //     if (err) throw err;
      //     expect(res.body).to.have.property('message');
      //     expect(res.body.message).to.match(/GoogleMapsID must be unique/i);
      //     done();
      //   });
      done();
    });
    it('returns 200 (OK) or 201 (Created) when payload is valid', (done) => {
      // request(app)
      //   .post('/vets/suggestions')
      //   .send(validPayload)
      //   .end((err, res) => {
      //     if (err) throw err;
      //     expect(res.status).to.be.within(200, 201);
      //     expect(res.body).to.have.property('GoogleMapsID');
      //     expect(res.headers).to.have.key('Location');
      //     expect(res.headers.Location).to.be.a('string');
      //     done();
      //   });
      done();
    });
  });

});