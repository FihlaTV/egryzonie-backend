const { describe, it, beforeEach, before } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const server = require('../../app');
const { signUp } = require('../helpers');

describe('/vets routes', function() {
  this.timeout(10000);

  let app;
  let mongoose;
  let user;
  let token;

  let vets;

  before(async () => {
    ({ app, mongoose } = await server.catch(err => console.error(err)));
    ({ user, token } = await signUp(app, request).catch(err => console.error(err)));

    const Vet = mongoose.model('vets');
    const User = mongoose.model('users');

    const exampleUser = await new User({
      Nickname: 'Valid Nickname',
      Email: 'valid@email.test',
      Password: '12345Abcdef',
      Role: 'admin'
    })
      .save()
      .catch(err => console.error(err));

    const exampleVets = [
      new Vet({
        GoogleMapsID: 'ChIJQ8EgpGpDBEcR1d0wYZTGPbI',
        Position: [ 52.458631, 16.905277 ],
        Name: 'Centrum Zdrowia Małych Zwierząt',
        Address: 'Osiedle Władysława Jagiełły 33, 60-694 Poznań',
        Rodents: true,
        ExoticAnimals: true,
        WebsiteURL: 'http://www.klinikawet.pl/',
        Phone: '61 824 31 77',
        Accepted: true,
        AcceptedDate: new Date('01/01/2016'),
        SuggestedBy: [exampleUser._id],
        AcceptedBy: exampleUser._id
      }),
      new Vet({
        GoogleMapsID: 'ChIJqzOyrPj7H0cRuNJG3u1SvGk',
        Position: [ 53.122827, 23.152517 ],
        Name: 'Przychodnia Małych Zwierząt',
        Address: 'Wesoła 16, 15-306 Białystok',
        Rodents: true,
        ExoticAnimals: true,
        WebsiteURL: 'http://www.xn--przychodniazwierzt-ycc.pl/',
        Phone: '85 742 38 00',
        Accepted: true,
        AcceptedDate: new Date('01/01/2016'),
        SuggestedBy: [exampleUser._id],
        AcceptedBy: exampleUser._id
      }),
      new Vet({
        GoogleMapsID: 'ChIJGZF6IAj7PEcRuvpLFvLUIXI',
        Position: [ 50.035121, 21.985198 ],
        Name: 'Zdrowa Łapa Centrum Aktywności i Rehabilitacji Małych Zwierząt',
        Address: 'Dębowa 12, 35-113 Rzeszów',
        Rodents: true,
        ExoticAnimals: true,
        WebsiteURL: 'http://www.zdrowalapa.pl/',
        Phone: '726 688 883',
        Accepted: true,
        AcceptedDate: new Date('01/01/2016'),
        SuggestedBy: [exampleUser._id],
        AcceptedBy: exampleUser._id
      })
    ];

    await Vet.insertMany(exampleVets).catch(err => console.error(err));

    vets = exampleVets;

    const firstVet = await Vet
      .findOne({})
      .populate('SuggestedBy', '_id Nickname Email AvatarURL')
      .populate('AcceptedBy', '_id Nickname Email AvatarURL');
    console.log('VET: ', firstVet);
  });

  describe('GET /vets', () => {
    it('returns 400 (Bad Request) without coordinates present', (done) => {
      request(app)
        .get('/vets')
        .expect(400)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.match(/Coordinates are missing/i);
          done();
        });
    });
    it('returns 400 (Bad Request) when coordinates are invalid', (done) => {
      request(app)
        .get('/vets')
        .query({ lat: -240.000000, lng: 666.000000, range: 200 })
        .expect(400)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.match(/Coordinates are invalid/i);
          done();
        });
    });
    it('returns an array when valid coordinates are present', (done) => {
      request(app)
        .get('/vets')
        .query({ lat: -90.000000, lng: 180.000000, range: 200 })
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).to.exist;
          expect(res.body).to.have.property('vets');
          expect(res.body.places).to.be.an('array');
          done();
        });
    });
  });

  // describe('POST /vets/suggestions', () => {
  //   const validPayload = {
  //     GoogleMapsID: 'ChIJ_RRLtDUcBEcREip9_VldDA4',
  //     Position: [ 52.706173, 16.380660 ],
  //     Name: 'Centrum Zdrowia Małych Zwierząt',
  //     Address: 'Poznańska 63A, 64-510 Wronki',
  //     Rodents: true,
  //     ExoticAnimals: true,
  //     WebsiteURL: 'http://www.centrum-wet.pl/',
  //     Phone: '510 517 636',
  //     Accepted: true,
  //     AcceptedDate: new Date('01/01/2016'),
  //     SuggestedBy: [1],
  //     AcceptedBy: 1
  //   };
  //   it('returns 400 (Bad Request) when GoogleMapsID is missing', (done) => {
  //     const invalidPayload = { ...validPayload, GoogleMapsID: null };
  //     request(app)
  //       .post('/vets/suggestions')
  //       .send(payload)
  //       .expect(400)
  //       .end((err, res) => {
  //         if (err) throw err;
  //         expect(res.body).to.have.property('message');
  //         expect(res.body.message).to.match(/GoogleMapsID is missing/i);
  //         done();
  //       });
  //   });
  //   it('returns 400 (Bad Request) when GoogleMapsID already exist', (done) => {
  //     const payload = vets[0];
  //     request(app)
  //       .post('/vets/suggestions')
  //       .send(payload)
  //       .expect(400)
  //       .end((err, res) => {
  //         if (err) throw err;
  //         expect(res.body).to.have.property('message');
  //         expect(res.body.message).to.match(/GoogleMapsID must be unique/i);
  //         done();
  //       });
  //   });
  //   it('returns 201 (Created) when payload is valid', (done) => {
  //     request(app)
  //       .post('/vets/suggestions')
  //       .send(validPayload)
  //       .expect(201)
  //       .end((err, res) => {
  //         if (err) throw err;
  //         expect(res.body).to.have.property('GoogleMapsID');
  //         expect(res.headers).to.have.key('Location');
  //         expect(res.headers.Location).to.be.a('string');
  //         done();
  //       });
  //   });
  // });
  
});