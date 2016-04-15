#!/usr/bin/env node

const argv = require('yargs')
  .default('p',8000)
  .default('sp',8001)
  .alias('p', 'port')
  .alias('sp', 'sio-port')
  .argv;

var xssproxy = require('../index');
xssproxy(argv.p,argv.sp);