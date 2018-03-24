
import { executeExpect } from '../../test-utils';

describe('operators', function() {
  describe('add', function () {
    it('should add two numbers together', function () {
      return executeExpect('3 + 5.5', 3 + 5.5);
    });
  });

  describe('subtract', function () {
    it('should subtract one number from another', function () {
      return executeExpect('3 - 5.5', 3 - 5.5);
    });
  });

  describe('multiply', function () {
    it('should multiply two numbers together', function () {
      return executeExpect('3 * 5.5', 3 * 5.5);
    });
  });

  describe('divide', function () {
    it('should divide a number by another', function () {
      return executeExpect('3 / 5.5', 3 / 5.5);
    });
  });

  describe('modulo', function () {
    it('should return the remainder of a division', function () {
      return executeExpect('3 % 5.5', 3 % 5.5);
    });
  });

  describe('power', function () {
    it('should calculate the first number to the power of the second', function () {
      return executeExpect('3 ** 5.5', 3 ** 5.5);
    });
  });
});
