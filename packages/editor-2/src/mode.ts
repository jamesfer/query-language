import { defineMode } from 'codemirror';
import Highlighter from './highlighter';

export const MODE_NAME = 'query-language';

let modeInitialized = false;

export function initializeMode() {
  if (!modeInitialized) {
    defineMode(MODE_NAME, (config, options) => (
      new Highlighter(config, options)
    ));
    modeInitialized = true;
  }
}
