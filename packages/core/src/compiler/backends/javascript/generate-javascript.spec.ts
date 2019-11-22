import { mkdir, writeFile, rmdir, unlink } from 'fs';
import { promisify } from 'util';
import { compile } from '../../../api';
import { convertToScope } from '../../../library';
import standardLibrary from '../../../standard-library/standard-library';
import { Expression } from '../../expression';
import { generateJavascript } from './generate-javascript';

const writeFilePromise = promisify(writeFile);
const mkdirPromise = promisify(mkdir);
const unlinkPromise = promisify(unlink);


describe('generate-javascript', () => {
  const directory = '/tmp/query-language-tests';

  async function execModule(code: string) {
    const fileName = `${directory}/module.js`;
    try {
      await unlinkPromise(`${directory}/module.js`);
    } catch (error) {}
    await writeFilePromise(fileName, code);
    return require(fileName);
  }

  beforeAll(async () => {
    try {
      await mkdirPromise(directory);
    } catch (error) {}
  });

  it('can do stuff', async () => {
    const code = `
      interface Size(A) { 
        getStrength: A => Integer
      } 
      
      implement Size(Integer) {
        getStrength: a => 4
      }
      
      implement Size(String) {
        getStrength: a => 1
      }
      
      getStrength(100)
    `;
    const result = await compile(code, convertToScope(standardLibrary));
    const script = await generateJavascript(result.expression as Expression);
    console.log(script);
    const actual = await execModule(script);
    console.log(actual);
    expect(actual).toBe(4);
  });
});