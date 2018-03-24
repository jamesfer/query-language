import { map } from 'lodash';
import { executeExpect } from '../../test-utils';

describe('map', function() {
  it('should apply an operation to each element of an array', function() {
    return executeExpect('map(sin, [1, 2, 3])', map([1, 2, 3], Math.sin));
  });
});
