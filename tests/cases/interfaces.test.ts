import { execute } from '../../src/api';
import { expect } from 'chai';

describe('interfaces', function() {
  describe('Equatable', function() {
    it('should be possible to call a method defined in an interface', async function() {
      const result = execute("5 = 5").result;
      expect(result).to.be.ok;
      if (result) {
        expect(await result.toPromise()).to.be.true;
      }
    });

    it('should be possible to call a method defined in an interface', async function() {
      const result = execute("'5' = '5'").result;
      expect(result).to.be.ok;
      if (result) {
        expect(await result.toPromise()).to.be.true;
      }
    });
  });

  describe('Orderable', function() {
    it('should be possible to order integers', async function() {
      const result = execute("4 < 5").result;
      expect(result).to.be.ok;
      if (result) {
        expect(await result.toPromise()).to.be.true;
      }
    });

    it('should be possible to order strings', async function() {
      const result = execute("'4' < '5'").result;
      expect(result).to.be.ok;
      if (result) {
        expect(await result.toPromise()).to.be.true;
      }
    });
  });
});
