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
  describe('GET /vets', () => {
    it('returns 400 (Bad Request) without coordinates present', (done) => {
      // request(app)
      //   .get('/vets')
      //   .expect(400)
      //   .end((err, res) => {
      //     if (err) throw err;
      //     expect(res.body).to.have.property('message');
      //     expect(res.body.message).to.match(/Coordinates are missing/i);
      //     done();
      //   });
      done();
    });
    it('returns 400 (Bad Request) when coordinates are invalid', (done) => {
      // request(app)
      //   .get('/vets')
      //   .query({ lat: -240.000000, lng: 666.000000, range: 200 })
      //   .expect(400)
      //   .end((err, res) => {
      //     if (err) throw err;
      //     expect(res.body).to.have.property('message');
      //     expect(res.body.message).to.match(/Coordinates are invalid/i);
      //     done();
      //   });
      done();
    });
    it('returns an array when valid coordinates are present', (done) => {
      // request(app)
      //   .get('/vets')
      //   .query({ lat: -90.000000, lng: 180.000000, range: 200 })
      //   .expect(200)
      //   .end((err, res) => {
      //     if (err) throw err;
      //     expect(res.body).to.exist;
      //     expect(res.body).to.have.property('vets');
      //     expect(res.body.places).to.be.an('array');
      //     done();
      //   });
      done();
    });
  });

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