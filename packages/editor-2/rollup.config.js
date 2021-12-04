import path from 'path';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';

export default {
  input: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    format: 'iife',
    file: path.resolve(__dirname, 'dist', 'index.js'),
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs({
      namedExports: {
        'query-language': ['TokenKind'],
        'codemirror': ['defineMode', 'fromTextArea'],
      },
    }),
    typescript({ target: 'es2015' }),
    babel({ extensions: ['.ts'] }),
  ],
  // external: id => id in dependencies
  //   || /^lodash/.test(id)
  //   || /^neo4j-driver/.test(id),
};
