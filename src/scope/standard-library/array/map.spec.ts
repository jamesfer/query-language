import { testExecute } from '../../../test-utils';
import { expect } from 'chai';
import { map } from 'lodash';

describe('map', function() {
  it('should apply an operation to each element of an array', function() {
    return testExecute('map(sin, [1, 2, 3])', values => {
      expect(values).to.eql(map([1, 2, 3], Math.sin));
    });
  });
});
