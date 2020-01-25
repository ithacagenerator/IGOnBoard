// jshint esversion: 8
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
if (!argv.members) {
  console.log('must provide members file path with --members');
  process.exit(-1);
}

const membersdata = fs.readFileSync(argv.members);
const members = JSON.parse(membersdata);

console.log(members);
