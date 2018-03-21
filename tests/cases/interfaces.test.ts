import { execute } from '../../src/api';
import { expect } from 'chai';

describe.only('interfaces', function() {
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
