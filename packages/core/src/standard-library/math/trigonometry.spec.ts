import { expect } from 'chai';
import { executeExpect, testExecute } from '../../test-utils';

describe('trigonometry', function() {
  describe('sin', function() {
    it('should calculate the sin of a number', function() {
      return executeExpect('sin(0.5)', Math.sin(0.5));
    });
  });

  describe('cos', function() {
    it('should calculate the cos of a number', function() {
      return executeExpect('cos(0.5)', Math.cos(0.5));
    });
  });

  describe('tan', function() {
    it('should calculate the tan of a number', function() {
      return testExecute('tan(0.5)', value => {
        expect(value).to.equal(Math.tan(0.5));
      });
    });
  });

  describe('asin', function() {
    it('should calculate the arcsin of a number', function() {
      return testExecute('asin(0.5)', value => {
        expect(value).to.equal(Math.asin(0.5));
      });
    });
  });

  describe('acos', function() {
    it('should calculate the arccos of a number', function() {
      return testExecute('acos(0.5)', value => {
        expect(value).to.equal(Math.acos(0.5));
      });
    });
  });

  describe('atan', function() {
    it('should calculate the arctan of a number', function() {
      return testExecute('atan(0.5)', value => {
        expect(value).to.equal(Math.atan(0.5));
      });
    });
  });
});

