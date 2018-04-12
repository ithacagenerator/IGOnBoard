//jshint esversion: 6
const express = require('express');
const router = express.Router();
const db = require('../util/db');

const uuid = require('uuid');
const moment = require('moment');

router.get('/test-email', (req, res, next) => {
  const member = req.body;
  if(member && member.email) { 
    // see if there's a record for this email address already
    db.findDocuments('authbox', 'Members', {email: member.email})
    .then(members => {      
      member.validationCode = uuid.v4();
      if(members.length === 0){
        return db.insertDocument('authbox', 'Members', member);
      } else if(members.length === 1) {
        if(!members[0].validated) {
          return db.updateDocument('authbox', 'Members', member)
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
    res.status(422).json({error: 'email field is required'});
  }
});

router.get('/validate-email/:validationCode', (req, res, next) => {
  const validationCode = req.params.validationCode;
  if(validationCode) {
    // attempt to update a document as validated by querying for the validationCode
    db.updateDocument('authbox', 'Members', 
      { validationCode },
      {
        $set: {validated: moment().format()},
        $unset: {validation: ''}
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