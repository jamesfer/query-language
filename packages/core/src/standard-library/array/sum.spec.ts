
import { executeExpect } from '../../test-utils';

describe('sum', function() {
  it('should sum the values in a list', function() {
    return executeExpect('sum([1.1, 2.2, 3.3])', 1.1 + 2.2 + 3.3);
  });

  it('should return 0 if the list is empty', function() {
    return executeExpect('sum([])', 0);
  });
});
