const path = require('path');
const bcrypt = require(path.resolve('src/core/util/bcrypt'));
const { describe, it } = require('mocha');
const { expect } = require('chai');

describe('## Bcrypt Util', () => {
  describe('# Basic function test', () => {
    it('is a function', () => {
      expect(bcrypt.hash).to.be.a('function');
    });
    it('is asynchronous', () => {
      const result = bcrypt.hash('text');
      expect(result).to.be.a('Promise');
    });
  });
  describe('# Encryption', () => {
    it('can encrypt text', async () => {
      const content = 'text';
      const hash = await bcrypt.hash(content);
      expect(hash).to.not.equal(content);
      expect(hash).to.match(/^\$[1-4][a-z]\$.{56}$/);
    });
  });
});