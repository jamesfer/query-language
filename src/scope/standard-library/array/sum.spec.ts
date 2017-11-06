import { testExecute } from '../../../test-utils';
import { expect } from 'chai';

describe('sum', function() {
  it('should sum the values in a list', function() {
    return testExecute('sum([1.1, 2.2, 3.3])', value => {
      expect(value).to.equal(1.1 + 2.2 + 3.3);
    });
  });

  it('should return 0 if the list is empty', function() {
    return testExecute('sum([])', value => {
      expect(value).to.equal(0);
    });
  });
});
