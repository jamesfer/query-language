import { executeExpect } from '../../test-utils';

describe.skip('operators', function() {
  describe('greaterThan', function () {
    it('should return true when the first operand is greater', function () {
      return executeExpect('15 > 5', true);
    });

    it('should return false when the operands are equal', function () {
      return executeExpect('5 > 5', false);
    });

    it('should return false when the first operand is less', function () {
      return executeExpect('0 > 5', false);
    });
  });

  describe('greaterEqual', function () {
    it('should return true when the first operand is greater', function () {
      return executeExpect('15 >= 5', true);
    });

    it('should return true when the operands are equal', function () {
      return executeExpect('5 >= 5', true);
    });

    it('should return false when the first operand is less', function () {
      return executeExpect('0 >= 5', false);
    });
  });

  describe('lessThan', function () {
    it('should return false when the first operand is greater', function () {
      return executeExpect('15 < 5', false);
    });

    it('should return false when the operands are equal', function () {
      return executeExpect('5 < 5', false);
    });

    it('should return true when the first operand is less', function () {
      return executeExpect('0 < 5', true);
    });
  });

  describe('lessEqual', function () {
    it('should return false when the first operand is greater', function () {
      return executeExpect('15 <= 5', false);
    });

    it('should return true when the operands are equal', function () {
      return executeExpect('5 <= 5', true);
    });

    it('should return true when the first operand is less', function () {
      return executeExpect('0 <= 5', true);
    });
  });

  describe('equal', function () {
    it('should return false when the first operand is greater', function () {
      return executeExpect('15 = 5', false);
    });

    it('should return true when the operands are equal', function () {
      return executeExpect('5 = 5', true);
    });

    it('should return false when the first operand is less', function () {
      return executeExpect('0 = 5', false);
    });
  });

  describe('notEqual', function () {
    it('should return true when the first operand is greater', function () {
      return executeExpect('15 != 5', true);
    });

    it('should return false when the operands are equal', function () {
      return executeExpect('5 != 5', false);
    });

    it('should return true when the first operand is less', function () {
      return executeExpect('0 != 5', true);
    });
  });
});
