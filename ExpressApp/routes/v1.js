//jshint esversion: 6
const express = require('express');
const router = express.Router();
const db = require('../util/db');

const uuid = require('uuid');
const moment = require('moment');
const homedir = require('homedir')();
const gmail_credentials = require(`${homedir}/gmail-credentials.json`);
const nodemailer = require('nodemailer');

const fs = require('fs');
const path = require('path');
const emailTemplatePath = path.join(__dirname, '..', 'routes', 'email-validation-template.html');
const emailVerificationEmailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
const wildcards = require('disposable-email-domains/wildcard.json');
const wildcardsRegex = wildcards.map(v => v.replace('.', '\\.'));
const legitEmailRegex = new RegExp(`^(?!((.*${wildcardsRegex.join(')|(.*')})))`); // tests true for non-blacklisted emails

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmail_credentials.user,
    pass: gmail_credentials.pass
  }
});

function sendEmail(to, subject, html) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: gmail_credentials.user,
      to,
      subject,
      html
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if(err) {
        console.log(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });  
}

router.post('/test-email', (req, res, next) => {
  const member = req.body;
  if(member && member.email) { 
    if(legitEmailRegex.test(member.email)){
      // see if there's a record for this email address already
      db.findDocuments('authbox', 'Members', {email: member.email})
      .then(members => {      
        member.validationCode = uuid.v4();
        if(members.length === 0){
          return db.insertDocument('authbox', 'Members', member);
        } else if(members.length === 1) {
          if(!members[0].validated) {
            return db.updateDocument('authbox', 'Members', {email: member.email}, member);
          } else {
            throw new Error(`Member is already validated`);
          }
        } else {
          throw new Error(`Found ${members.length} records with email address`);
        }
      })
      .then(result => {
        // either a member was inserted or a member was updated with a validation code
        // result should either have an insertedId or modifiedCount
        if(result.insertedId || result.modifiedCount) {
          // send an email to the user with a link to click on
          return sendEmail(member.email, 
            'Ithaca Generator Email Validation', 
            emailVerificationEmailTemplate.replace('{{validationCode}}',
            member.validationCode));
        } else {
          throw new Error('Database operation failed');
        }
      })
      .then(result => {
        res.json({status: 'ok'});
      })
      .catch(error => {
        res.status(422).json({ error: error.message });
      });
    } else {
      res.status(422).json({error: 'Email address is not valid'});  
    }
  } else {
    res.status(422).json({error: 'Email field is required'});
  }
});

router.get('/validate-email/:validationCode', (req, res, next) => {
  const validationCode = req.params.validationCode;
  if(validationCode) {
    // attempt to update a document as validated by querying for the validationCode
    db.updateDocument('authbox', 'Members', 
      { validationCode },
      {
        $set: { validated: moment().format() },
        $unset: { validationCode: '' }
      },
      { updateType: 'complex' }
    )
    .then(result => {
      if(result.modifiedCount) {
        res.send(`VALIDATION SUCCESSFUL`);
      } else {
        throw new Error('No records were modified');
      }
    })
    .catch(error => {
      res.send(`VALIDATION FAILED - ${ error.message }`);
    });
  } else {
    res.send(`VALIDATION FAILED`);
  }
});

module.exports = router;