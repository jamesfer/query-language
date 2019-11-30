import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import runner from '../cli';

describe('compile command', () => {
  let dir: string;

  function tmpFile(): string {
    return path.join(dir, Math.random().toString(32).slice(2));
  }

  async function writeToTmpFile(code: string): Promise<string> {
    const filepath = tmpFile();
    await fs.writeFile(filepath, code);
    return filepath;
  }

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.resolve(os.tmpdir(), 'query-language-compile-tests'));
  });

  afterAll(async () => {
    if (dir) {
      await fs.rmdir(dir, { recursive: true });
    }
  });

  describe('when compilation is successful', () => {
    let file: string;

    beforeAll(async () => {
      file = await writeToTmpFile('1 + 1');
    });

    it('outputs the result to stdout by default', async () => {
      const logMock = jest.fn();
      await runner(logMock).parse(['compile', file]);
      expect(logMock).toHaveBeenCalledTimes(1);
      expect(logMock.mock.calls[0][0].length).toBeGreaterThan(50);
    });

    it('outputs the result to stdout when output file is -', async () => {
      const logMock = jest.fn();
      await runner(logMock).parse(['compile', file, '-o', '-']);
      expect(logMock).toHaveBeenCalledTimes(1);
      expect(logMock.mock.calls[0][0].length).toBeGreaterThan(50);
    });

    it('outputs the result to another file using an absolute path', async () => {
      const outFile = tmpFile();
      await runner(() => {}).parse(['compile', file, '-o', outFile]);
      const contents = (await fs.readFile(outFile)).toString();
      expect(contents.length).toBeGreaterThan(50);
    });

    it('outputs the result to another file using a relative path', async () => {
      const outFile = tmpFile();
      const relativeFile = path.relative(__dirname, outFile);
      await runner(() => {}).parse(['compile', file, '-o', relativeFile]);
      const contents = (await fs.readFile(relativeFile)).toString();
      expect(contents.length).toBeGreaterThan(50);
    });
  });
});
