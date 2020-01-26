//jshint esversion: 8
const argv = require('minimist')(process.argv.slice(2));
const { sendEmail } = require('./routes/v1');

