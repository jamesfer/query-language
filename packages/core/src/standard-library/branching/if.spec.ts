import { executeExpect } from '../../test-utils';

describe.only('if', function() {
  it('should return the true branch', function() {
    return executeExpect('if(1, 1, 2)', 1);
  });

  it('should return the false branch', function() {
    return executeExpect('if(0, 1, 2)', 2);
  });

  it('should return the true branch when passed an expression', function() {
    return executeExpect('if(1 < 2, 1, 2)', 1);
  });

  it('should return the false branch when passed an expression', function() {
    return executeExpect('if(1 > 2, 1, 2)', 2);
  });
});
