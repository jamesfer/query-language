import runner from './cli';

runner().parse(process.argv.slice(2)).catch((error) => {
  console.log(error);
  process.exit(1);
});
