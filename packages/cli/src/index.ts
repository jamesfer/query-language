import yargs from 'yargs';
import compileCommand from './compile/compile';

yargs.command(compileCommand).help().argv;
