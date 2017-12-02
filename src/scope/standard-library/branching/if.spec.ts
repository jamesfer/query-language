import { expect } from 'chai';
import { testExecute } from '../../../test-utils';

describe('if', function() {
  it('should return the true branch', function() {
    return testExecute('if(1, 1, 2)', value => {
      expect(value).to.equal(1);
    });
  });

  it('should return the false branch', function() {
    return testExecute('if(0, 1, 2)', value => {
      expect(value).to.equal(1);
    });
  });
});
