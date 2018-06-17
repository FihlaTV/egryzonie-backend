const path = require('path');
const { describe, it, before, after } = require('mocha');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { createUsers, createVets } = require('../../helpers');

require(path.resolve('src/modules/user/user.model'));
require(path.resolve('src/modules/vets/vet.model'));

const User = mongoose.model('users');
const Vet = mongoose.model('vets');

describe('Vet Model', function () {
  this.timeout(25000);

  let user;
  let vet;

  const vetPayload = {
    GoogleMapsID: 'ChIJQ8EgpGpDBEcR1d0wYZTGPbJ',
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


  /**
   * Validation of fields
   */
  describe('## Validation of fields', () => {
    describe('# Validation', () => {

      // ===== Google Maps ID
      it('Rejects invalid GoogleMapsID', () => {
        const newVet = new Vet({ ...vetPayload, GoogleMapsID: 'randomstring' });
        const err = newVet.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('GoogleMapsID');
        expect(err.errors.GoogleMapsID.message).to.match(/invalid google maps id/i);
      });

      // ===== Coordinates
      it('Rejects invalid position (coordinates)', () => {
        const newVet = new Vet({ ...vetPayload, Position: [ 99.123123, 192.123123 ]});
        const err = newVet.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('Position');
        expect(err.errors.Position.message).to.match(/invalid coordinates/i);
      });

      // ===== Website URL
      it('Rejects invalid website URL', () => {
        const newVet = new Vet({ ...vetPayload, WebsiteURL: 'htts://invalid.address.com/' });
        const err = newVet.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('WebsiteURL');
        expect(err.errors.WebsiteURL.message).to.match(/invalid website url/i);
      });

      // ===== Phone Number
      it('Rejects invalid phone number', () => {
        const newVet = new Vet({ ...vetPayload, Phone: '866-100-Tom' });
        const err = newVet.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('Phone');
        expect(err.errors.Phone.message).to.match(/invalid phone number/i);
      });
    });
  });


  /**
   * Hooks
   */
  describe('## Hooks', () => {
    describe('# Pre-validate hooks', () => {
      it('Generates a valid slug', async () => {
        const newVet = new Vet({ ...vetPayload });
        const err = newVet.validateSync();
        await newVet.save().catch(err => console.error(err));
        expect(newVet.Slug).to.exist;
        expect(newVet.Slug).to.match(/^[a-z0-9\-]{5,}$/);
        // we're inserting a new "Centrum Zdrowia Małych Zwierząt", which isn't the first in the database;
        // so we're expecting to find a number as a prefix for the slug
        const firstPart = newVet.Slug.slice(0, newVet.Slug.indexOf('-'));
        expect(firstPart).to.match(/^[0-9]{1,}$/);
      });
    });
  });


  /**
   * Static methods
   */
  describe('## Static methods', () => {

    // ===== findWithinRange()
    describe('# findWithinRange() method', () => {
      it('Retrieves expected places within specific radius', async () => {
        const distance = 160;
        // Why 1 ant then 0? MongoDB geospatial queries require
        // the use of reversed order - first longitude, then lattitude
        const lat = parseFloat((vet.Position[1]+0.001).toFixed(6));
        const lng = parseFloat((vet.Position[0]+0.001).toFixed(6));
        const foundVet = await Vet
          .findWithinRange(distance, lat, lng)
          .catch(error => console.error(error));
        expect(foundVet).to.be.an('array');
        expect(foundVet).to.not.be.empty;
        expect(foundVet.length).to.be.above(0);
        expect(foundVet[0]).to.exist;
        expect(foundVet[0]).to.be.an('object');
        expect(foundVet[0]).to.have.property('GoogleMapsID');
        expect(foundVet[0].GoogleMapsID).to.equal(vet.GoogleMapsID);
      });
      it('Retrieves no places with too short radius', async () => {
        const distance = 60;
        const lat = parseFloat((vet.Position[1]+0.001).toFixed(6));
        const lng = parseFloat((vet.Position[0]+0.001).toFixed(6));
        const foundVet = await Vet
          .findWithinRange(distance, lat, lng)
          .catch(error => console.error(error));
        expect(foundVet).to.be.empty;
        expect(foundVet.length).to.equal(0);
      });
    });
    
    // ===== findByNameOrAddress()
    describe('# findByNameOrAddress() method', () => {
      it('Retrieves example places by a correct address', async () => {
        const searchText = 'Osiedle Władysława';
        const foundVet = await Vet
          .findByNameOrAddress(searchText)
          .catch(error => console.error(error));
        expect(foundVet).to.not.be.empty;
        expect(foundVet).to.be.an('array');
        expect(foundVet.length).to.be.above(0);
        expect(foundVet[0]).to.exist;
        expect(foundVet[0]).to.be.an('object');
        expect(foundVet[0]).to.have.property('Address');
        expect(foundVet[0].Address).to.match(new RegExp(searchText, 'i'));
      });
      it('Can retrieve places by a correct name', async () => {
        const searchText = 'zwierząt';
        const foundVets = await Vet
          .findByNameOrAddress(searchText)
          .catch(error => console.error(error));
        expect(foundVets).to.not.be.empty;
        expect(foundVets).to.be.an('array');
        expect(foundVets.length).to.be.above(3);
        for (let i = 0; i < foundVets.length; i++) {
          expect(foundVets[i]).to.exist;
          expect(foundVets[i]).to.be.an('object');
          expect(foundVets[i]).to.have.property('Name');
          expect(foundVets[i].Name).to.match(new RegExp(searchText, 'i'));
        }
      });
      it('Does not retrieve any places that do not match', async () => {
        const searchText = 'some random text';
        const foundVets = await Vet
          .findByNameOrAddress(searchText)
          .catch(error => console.error(error));
        expect(foundVets).to.be.empty;
      });
    });
  });

  /**
   * Instance methods
   */
  describe('## Instance methods', () => {
  });
});
