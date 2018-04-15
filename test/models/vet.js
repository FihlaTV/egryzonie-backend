const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const mongoose = require('mongoose');
require('../../src/models');
const { createUsers, createVets } = require('../helpers');

const User = mongoose.model('users');
const userPayload = {
  Nickname: 'Valid Nickname',
  Email: 'valid@email.com',
  Password: 'Valid#Password'
};

const Vet = mongoose.model('vets');
const vetPayload = {
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
  SuggestedBy: [],
  AcceptedBy: null
};

describe('Vet Model', function () {
  this.timeout(10000);

  let user;
  let vet;

  before((done) => {
    mongoose.connect('mongodb://localhost/egryzonie-test');
    mongoose.connection
      .once('open', async () => {
        const exampleUsers = await createUsers(mongoose).catch(err => console.error(err));
        const exampleVets = await createVets(mongoose, exampleUsers).catch(err => console.error(err));
        user = exampleUsers[0];
        vet = exampleVets[0];
        done();
      })
      .on('error', (error) => console.error('Connection error: ', error.message));
  });

  after((done) => {
    mongoose.connection.collections.users.drop(() => {
      mongoose.connection.collections.vets.drop(() => done());
    });
  });

  describe('validation of basic fields', () => {
    it('rejects invalid GoogleMapsID', () => {
      const newVet = new Vet({ ...vetPayload, GoogleMapsID: 'randomstring' });
      const err = newVet.validateSync();
      expect(err.errors).to.exist;
      expect(err.errors).to.have.property('GoogleMapsID');
      expect(err.errors.GoogleMapsID.message).to.match(/google maps id is invalid/i);
    });
    it('rejects invalid position (coordinates)', () => {
      const newVet = new Vet({ ...vetPayload, Position: [ 99.123123, 192.123123 ] });
      const err = newVet.validateSync();
      expect(err.errors).to.exist;
      expect(err.errors).to.have.property('Position');
      expect(err.errors.Position.message).to.match(/coordinates are invalid/i);
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
