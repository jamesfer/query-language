import { expect } from 'chai';
import { testExecute } from '../../../test-utils';

describe('head', function() {
  it('should return the first element of an array', function() {
    return testExecute('head([1, 2, 3])', value => {
      expect(value).to.equal(1);
    });
  });

  // it('should return null if the element is null', function() {
  //   return testExecute('head([])', value => {
  //     expect(value).to.equal(null);
  //   });
  // });
});
