import { expect } from 'chai';
import { testExecute } from '../../test-utils';

describe('in (array)', function() {
  it('should return true if the value appears in the array', function() {
    return testExecute('1 in [1, 2, 3]', value => expect(value).to.equal(true));
  });

  it('should return false otherwise', function() {
    return testExecute('1 in [2, 3]', value => expect(value).to.equal(false));
  });

  it('should return false for empty arrays', function() {
    return testExecute('1 in []', value => expect(value).to.equal(false));
  });
});
