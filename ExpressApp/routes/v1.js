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

function buildRegistrationUpdate(member) {
  const ret = {};
  if(member && (typeof member === 'object')){
    Object.keys(member).forEach(k => {
      ret[`registration.${k}`] = member[k];
    });
  }
  if( member.firstname && member.lastname ) {
    ret.name = `${member.firstname} ${member.lastname}`;
  }

  return ret;
}

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
        const validationCode = uuid.v4();
        if(members.length === 0){
          return db.insertDocument('authbox', 'Members', Object.assign({}, member, {validationCode}))
          .then(result => {
            member.validationCode = validationCode;
            return result;
          });
        } else if(members.length === 1) {
          if(!members[0].deleted) { // previous member making a comeback?
            members[0].validated = false;
            members[0].registrationComplete = false;
          }
          if(!members[0].validated) {
            const email = member.email;
            delete member.email;        
            const updateObj = buildRegistrationUpdate(member);
            updateObj.validationCode = validationCode;
            return db.updateDocument('authbox', 'Members', {email}, updateObj)
            .then(result => {
              member.email = email;
              member.validationCode = validationCode;
              return result;
            });
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
            emailVerificationEmailTemplate.replace(/{{validationCode}}/g,
            `${member.validationCode}/${encodeURIComponent(member.email)}`));
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

router.get('/validate-email/:validationCode/:email?', (req, res, next) => {
  const validationCode = req.params.validationCode;
  const email = req.params.email;
  if(validationCode) {
    // attempt to update a document as validated by querying for the validationCode
    db.updateDocument('authbox', 'Members', 
      { validationCode },
      {
        $set: { validated: moment().format() },
        $unset: { validationCode: true, deleted: true}
      },
      { updateType: 'complex' }
    )
    .then(result => {
      if(result.modifiedCount) {        
        res.send(`VALIDATION SUCCESSFUL! Close this Window and go back to the registration window, or just click <a href="https://ithacagenerator.org/onboard/welcome/${encodeURIComponent(email)}">here</a> to resume.`);
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

router.get('/email-validated/:email', (req, res, next) => {
  const email = req.params.email;
  db.findDocuments('authbox', 'Members', {email})
  .then(members => {
    if(members.length === 1) {
      res.json(!!members[0].validated);
    } else if(members.length === 0){
      throw new Error(`No records with email address`);
    } else {
      throw new Error(`Found ${members.length} records with email address`);
    }
  })
  .catch(error => {
    res.status(422).json({error});
  });
});

// updates the member record by email address
// the result comes back 422 if the member already has an active
// completed registration
router.put('/member-registration', (req, res, next) => {
  // attempt to update a document 
  const member = req.body;

  if(member.membershipPoliciesAgreedTo) {
    member.membershipPoliciesAgreedTo = moment().format();
  }
  if(member.waiverAccepted) {
    member.waiverAccepted = moment(validated).format();
  }
  
  const email = member.email;
  delete member.email;
  const updateObj = buildRegistrationUpdate(member);
  db.updateDocument('authbox', 'Members', { 
    $and: [
      {email},
      {$or: [
        {registrationComplete: {$ne: true}},
        {deleted: true}
      ]}
    ]
  }, updateObj)
  .then(result => {
    if(!result.matchedCount) {
      throw new Error('No eligible records were matched');
    }
  })
  .then(() => {
    res.json({status: 'ok'});
  })
  .catch(error => {
    res.status(422).json({error: error.message});
  });
});

// fetches the member associated with the email from the database
// the result comes back 422 if the member already has an active
// completed registration
router.get('/member-registration/:email', (req, res, next) => {
  db.findDocuments('authbox', 'Members', {
    $and: [
      {email: req.params.email},
      {registrationComplete: {$ne: true}}
      // {$or: [
      //   {registrationComplete: {$ne: true}},
      //   {deleted: true}
      // ]}
    ]
  }, { 
    projection: {
      deleted: 1,
      registration: 1
    }
  })
  .then(members => {
    if(Array.isArray(members) && members.length === 1) {
      if(members[0].deleted) {
        members[0].registration = {};
      }
      return members[0].registration;
    } else {
      throw new Error(`Found ${members.length} records with email address`);
    }
  })
  .then(member => {
    res.json(member);
  })
  .catch(error => {
    res.status(422).json({error: error.message});
  });
});

module.exports = router;