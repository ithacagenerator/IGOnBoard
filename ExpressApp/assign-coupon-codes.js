// jshint esversion: 8
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const { generateCouponCode } = require('./routes/couponCodes');
const { findDocuments, updateDocument } = require('./util/db');
if (!argv.members) {
  console.log('must provide members file path with --members');
  process.exit(-1);
}

const membersdata = fs.readFileSync(argv.members);
const members = JSON.parse(membersdata);

if (!Array.isArray(members)) {
  console.log('members file must, but does not, contain an array');
  process.exit(-2);
}

if (members.length <= 0) {
  console.log('members file contains an empty array');
  process.exit(-3);
}

members.forEach(member => {
  if (!member.email) {
    console.log('members file records should contain an email', member);
    process.exit(-4);
  }

  if (!members[0].name) {
    console.log('members file records should contain a name', member);
    process.exit(-5);
  }
});

// ok now we're all good
console.log(generateCouponCode, updateDocument, findDocuments);