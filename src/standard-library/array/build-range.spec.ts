import { expect } from 'chai';
import { testExecute } from '../../../test-utils';
import { range } from 'lodash';

describe('buildRange', function() {
  it('should build a bounded range', function() {
    return testExecute('3..5', values => {
      expect(values.length).to.equal(2);
      expect(values).to.eql(range(3, 5));
    });
  });

  it('should build a inverse bounded range', function() {
    return testExecute('5..3', values => {
      expect(values.length).to.equal(2);
      expect(values).to.eql(range(5, 3));
    });
  });

  it('should build a range with no lower bound', function() {
    return testExecute('..5', values => {
      expect(values.length).to.equal(5);
      expect(values).to.eql(range(5));
    });
  });

  it('should build a inverse range with no lower bound', function() {
    return testExecute('..-5', values => {
      expect(values.length).to.equal(5);
      expect(values).to.eql(range(-5));
    });
  });
});
