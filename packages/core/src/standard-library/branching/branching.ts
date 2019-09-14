import { Library } from '../../library';
import { ifFunc } from './if';

const branching: Library = {
  nativeLambdas: {
    if: ifFunc,
  },
};

export default branching;
