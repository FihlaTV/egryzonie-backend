const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const mongoose = require('mongoose');
require('../../src/models');
const { createUsers, createVets } = require('../helpers');

const User = mongoose.model('users');
const Vet = mongoose.model('vets');

describe('Vet Model', function () {
  this.timeout(25000);

  let user;
  let vet;

  const vetPayload = {
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
    SuggestedBy: []
  };

  before((done) => {
    mongoose.connect('mongodb://localhost/egryzonie-test');
    mongoose.connection
      .once('open', async () => {
        await User.remove({});
        await Vet.remove({});

        const exampleUsers = await createUsers(mongoose).catch(err => console.error(err));
        const exampleVets = await createVets(mongoose, exampleUsers).catch(err => console.error(err));
        user = exampleUsers[0];
        vet = exampleVets[0];

        done();
      })
      .on('error', (error) => console.error('Connection error: ', error.message));
  });

  after(async () => {
    await User.remove({});
    await Vet.remove({});
  });

  describe('validation of basic fields', () => {
    it('rejects invalid GoogleMapsID', () => {
      const newVet = new Vet({ ...vetPayload, GoogleMapsID: 'randomstring' });
      const err = newVet.validateSync();
      expect(err.errors).to.exist;
      expect(err.errors).to.have.property('GoogleMapsID');
      expect(err.errors.GoogleMapsID.message).to.match(/invalid google maps id/i);
    });
    it('rejects invalid position (coordinates)', () => {
      const newVet = new Vet({ ...vetPayload, Position: [ 99.123123, 192.123123 ]});
      const err = newVet.validateSync();
      expect(err.errors).to.exist;
      expect(err.errors).to.have.property('Position');
      expect(err.errors.Position.message).to.match(/invalid coordinates/i);
    });
    it('rejects invalid website URL', () => {
      const newVet = new Vet({ ...vetPayload, WebsiteURL: 'htts://invalid.address.com/' });
      const err = newVet.validateSync();
      expect(err.errors).to.exist;
      expect(err.errors).to.have.property('WebsiteURL');
      expect(err.errors.WebsiteURL.message).to.match(/invalid website url/i);
    });
    it('rejects invalid phone number', () => {
      const newVet = new Vet({ ...vetPayload, Phone: '866-100-Tom' });
      const err = newVet.validateSync();
      expect(err.errors).to.exist;
      expect(err.errors).to.have.property('Phone');
      expect(err.errors.Phone.message).to.match(/invalid phone number/i);
    });
  });

  describe('data retrieval', () => {
    it('can find user who suggested vet', async () => {
      const foundVet = await Vet
        .findOne({})
        .populate('SuggestedBy', '_id Nickname Email AvatarURL')
        .catch(error => console.error(error));
      expect(foundVet).to.not.be.null;
      expect(foundVet).to.have.property('SuggestedBy');
      expect(foundVet).to.have.property('AcceptedBy');
      expect(foundVet.SuggestedBy).to.be.an('array');
    });

    it('gets no places with too short radius', async () => {
      const maxDistance = 50;
      const origin = [ parseFloat((vet.Position[0]+0.001).toFixed(6)), parseFloat((vet.Position[1]+0.001).toFixed(6)) ];
      const foundVet = await Vet
        .find({
          Position: {
            $near:{
              $geometry: { type: 'Point', coordinates: origin },
              $minDistance: 0,
              $maxDistance: maxDistance
            }
          }
        })
        .catch(error => console.error(error));
      expect(foundVet).to.be.an('array');
      expect(foundVet).to.be.empty;
    });

    it('gets 1 place in radius od 160 meters using geoNear', async () => {
      const maxDistance = 160;
      const origin = [ parseFloat((vet.Position[0]+0.001).toFixed(6)), parseFloat((vet.Position[1]+0.001).toFixed(6)) ];
      const foundVet = await Vet
        .find({
          Position: {
            $near:{
              $geometry: { type: 'Point', coordinates: origin },
              $minDistance: 0,
              $maxDistance: maxDistance
            }
          }
        })
        .catch(error => console.error(error));
      expect(foundVet).to.not.be.empty;
      expect(foundVet).to.be.an('array');
      expect(foundVet.length).to.equal(1);
      expect(foundVet[0]).to.exist;
      expect(foundVet[0]).to.be.an('object');
      expect(foundVet[0]).to.have.property('GoogleMapsID');
      expect(foundVet[0].GoogleMapsID).to.equal(vet.GoogleMapsID);
    });

    it('retrieves example places by lat/lng with Model static method', async () => {
      const distance = 160;

      // Why 1 ant then 0? MongoDB geospatial queries require
      // the use of reversed order - first longitude, then lattitude
      const lat = parseFloat((vet.Position[1]+0.001).toFixed(6));
      const lng = parseFloat((vet.Position[0]+0.001).toFixed(6));

      const foundVet = await Vet
        .findWithinRange(distance, lat, lng)
        .catch(error => console.error(error));
      expect(foundVet).to.not.be.empty;
      expect(foundVet).to.be.an('array');
      expect(foundVet.length).to.equal(1);
      expect(foundVet[0]).to.exist;
      expect(foundVet[0]).to.be.an('object');
      expect(foundVet[0]).to.have.property('GoogleMapsID');
      expect(foundVet[0].GoogleMapsID).to.equal(vet.GoogleMapsID);
    });

    it('retrieves example places by address', async () => {
      const searchText = 'Osiedle Władysława';

      const foundVet = await Vet
        .findByNameOrAddress(searchText)
        .catch(error => console.error(error));

      expect(foundVet).to.not.be.empty;
      expect(foundVet).to.be.an('array');
      expect(foundVet.length).to.equal(1);
      expect(foundVet[0]).to.exist;
      expect(foundVet[0]).to.be.an('object');
      expect(foundVet[0]).to.have.property('Address');
      expect(foundVet[0].Address).to.match(new RegExp(searchText, 'i'));
    });

    it('can retrieve places by name', async () => {
      const searchText = 'zwierząt';

      const foundVets = await Vet
        .findByNameOrAddress(searchText)
        .catch(error => console.error(error));

      expect(foundVets).to.not.be.empty;
      expect(foundVets).to.be.an('array');
      expect(foundVets.length).to.equal(3);
      for (let i = 0; i < foundVets.length; i++) {
        expect(foundVets[i]).to.exist;
        expect(foundVets[i]).to.be.an('object');
        expect(foundVets[i]).to.have.property('Name');
        expect(foundVets[i].Name).to.match(new RegExp(searchText, 'i'));
      }
    });

    it('does not retrieve any places that do not match', async () => {
      const searchText = 'some random text';

      const foundVets = await Vet
        .findByNameOrAddress(searchText)
        .catch(error => console.error(error));

      expect(foundVets).to.be.empty;
    });
  });

  describe('applying suggestions from user to vet', () => {
    it('can toggle user recommendation for vet', async () => {
      const vet = await Vet
        .findOne({})
        .catch(error => console.log(error));

      const exists = vet.SuggestedBy.indexOf(user._id) > -1;
      const newVet = await vet.toggleUserRecommendation(user);
      if (exists) {
        expect(newVet.SuggestedBy).to.not.include(user._id);
      } else {
        expect(newVet.SuggestedBy).to.include(user._id);
      }
    });
  });
});
