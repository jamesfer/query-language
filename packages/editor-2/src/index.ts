import Editor from './editor';

const element = document.getElementById('editor');
if (!element) {
  throw new Error('Could not find #editor elemet');
}
const editor = new Editor(element as HTMLTextAreaElement);
