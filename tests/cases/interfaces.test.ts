import { execute } from '../../src/api';

describe.skip('interfaces', function() {
  it('should be possible to call a method defined in an interface', async function() {
    const result = execute("'5' = '5'").result;
    if (result) {
      console.log(await result.toPromise());
    } else {
      throw new Error('no result');
    }
  });
});
