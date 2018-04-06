const { describe, it, before, beforeEach } = require('mocha');
const { expect } = require('chai');
const mongoose = require('mongoose');
require('../../src/models/user');

const User = mongoose.model('users');
const validUserPayload = {
  Nickname: 'Valid Nickname',
  Email: 'valid@email.com',
  Password: 'Valid#Password'
};

describe('User Model', () => {
  before((done) => {
    mongoose.connect('mongodb://localhost/egryzonie-test');
    mongoose.connection
      .once('open', () => done())
      .on('error', (error) => console.error('Connection error: ', error.message));
  });

  beforeEach((done) => {
    mongoose.connection.collections.users.drop(() => done());
  });

  describe('validation of basic fields', () => {
    it('accepts valid payload', () => {
      const user = new User(validUserPayload);
      const err = user.validateSync();
      expect(err).to.be.undefined;
    });

    describe('email', () => {
      it('returns errors if Nickname or Email is empty', () => {
        const user = new User();
        const err = user.validateSync();
        expect(err.errors.Nickname).to.exist;
        expect(err.errors.Email).to.exist;
      });
      it('returns errors if Email is invalid', () => {
        const user = new User({
          Email: 'invalid@email#'
        });
        const err = user.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('Email');
        expect(err.errors.Email.properties.message).to.equal('invalid e-mail');
      });
    });

    describe('nickname', () => {
      it('returns error if Nickname is invalid', () => {
        const user = new User({
          Nickname: 'eve',
          Email: 'kontakt@patrykb.pl'
        });
        const err = user.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('Nickname');
        expect(err.errors.Nickname.properties.message).to.equal('invalid nickname');
      });
      it('returns error if Nickname contains illegal characters', () => {
        const user = new User({
          Nickname: 'eve###',
          Email: 'kontakt@patrykb.pl'
        });
        const err = user.validateSync();
        expect(err.errors.Nickname).to.exist;
        expect(err.errors).to.have.property('Nickname');
        expect(err.errors.Nickname.properties.message).to.equal('invalid nickname');
      });
    });

    describe('role', () => {
      it('has default role "user"', () => {
        const user = new User(validUserPayload);
        const err = user.validateSync();
        expect(user.Role).to.equal('user');
      });
      it('does not allow incorrect role', () => {
        const user = new User({
          ...validUserPayload,
          Role: 'someInvalidRole'
        });
        const err = user.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('Role');
        expect(err.errors.Role.properties.message).to.equal('invalid role');
      });
    });
  });

  describe('validation of additional fields', () => {
    describe('avatar url', () => {
      it('rejects invalid avatar URL', () => {
        const user = new User({
          ...validUserPayload,
          AvatarURL: 'httpurl/image.image.jpeg'
        });
        const err = user.validateSync();
        expect(err.errors).to.exist;
        expect(err.errors).to.have.property('AvatarURL');
        expect(err.errors.AvatarURL.properties.message).to.equal('invalid image URL');
      });
      it('accepts valid avatar URL', () => {
        const user = new User({
          ...validUserPayload,
          AvatarURL: 'http://google.com/url/image.image.jpeg'
        });
        const err = user.validateSync();
        expect(err).to.be.undefined;
      })
    });
  });

  describe('password encryption', () => {
    it('hashes the password before saving', (done) => {
      const user = new User({
        Nickname: 'Valid Nickname',
        Email: 'valid@email.com',
        Password: 'Valid#Password'
      });
      user.save((err) => {
        expect(err).to.be.null;
        expect(user.Password).to.match(/^\$2a\$/);
        done();
      });
    });
  });
});
