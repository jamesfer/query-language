import { executeExpect } from '../../../test-utils';

describe('take', function() {
  it('should take a certain number of values from a list', function() {
    return executeExpect('take(2, [1.1, 2.2, 3.3])', [ 1.1, 2.2 ]);
  });

  it('should return an empty list if the input list is empty', function() {
    return executeExpect('take(1, [])', []);
  });
});
