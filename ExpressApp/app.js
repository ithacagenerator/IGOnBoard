//jshint esversion: 6
var compression = require('compression');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var v1 = require('./routes/v1');
var app = express();
var cors = require('cors');
var ipn = require('express-ipn');
const db = require('./util/db');
const moment = require('moment');

app.use(compression());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '20mb', extended: true}));
app.use(bodyParser.urlencoded({ extended: false })); // IPN data is sent in the body as x-www-form-urlencoded data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../AngularApp/dist')));

app.post('/notify/:notifyId', ipn.validator(ipnValidationHandler, true));

function ipnValidationHandler(err, ipnContent, req) {
  if (err) {
      console.error("IPN invalid");              // The IPN was invalid
  } else {
      console.log(`Incoming IPN: `, ipnContent, req.params); // The IPN was valid.
      let memberEmail;
      db.updateDocument('authbox', 'Members', {$or: [
        { "registration.notifyId": req.params.notifyId },
        { "paypal.subscr_id": ipnContent.subscr_id }
      ]}, {
        $push: { paypal: ipnContent },
        $set: {
          "registration.registrationComplete": true,
          "registration.notifyId": req.params.notifyId
        }
      }, { updateType: 'complex' }) // bind the paypal data to the member
      .then((result) => {
        console.log(`IPN modified ${result.modifiedCount} member records.`);
        if(result.modifiedCount === 1) {
          // find the member's email, and if called for send a welcome email
          return db.findDocuments('authbox', 'Members',{ 'registration.notifyId': req.params.notifyId })
          .then((members) => {
            if (members && members[0] && members[0].email) {
              memberEmail = members[0].email;
              if (!members[0].welcomeEmailSent) {
                return v1.sendWelcomeEmail(members[0].email) // send the new member welcome email to this person
                .then(() => {
                  return db.updateDocument('authbox', 'Members', { 'registration.notifyId': req.params.notifyId }, { welcomeEmailSent: true });
                })
                .catch((err) => {
                  console.error(err.message, err.stack);
                });
              }
            }
          });
        } else {
          console.error(`Got IPN to '${req.params.notifyId}', which doesn't match any user`);
        }
      })
      .then(() => {
        // now consider taking some special action associated with some bad IPN results
        // empirically we've seen these values come through for membership subscriptions txn_type field
        // 'subscr_payment'
        // 'subscr_signup'
        // 'subscr_cancel' *
        // 'subscr_eot' *
        // 'recurring_payment_suspended' *
        // 'subscr_failed'
        // 'recurring_payment_suspended_due_to_max_failed_payment' *
        // 'subscr_modify'
        //
        // and the ones with asterisks are associated with member cancellations
        // someone should probably also be notified if subscr_failed happens as
        // it is generally the predecessor to recurring_payment_suspended_due_to_max_failed_payment

        ipnContent = ipnContent || {};
        if(ipnContent.txn_type) {
          if(['subscr_cancel',
            'subscr_eot',
            'recurring_payment_suspended',
            'recurring_payment_suspended_due_to_max_failed_payment'].indexOf(ipnContent.txn_type) >= 0) {
            // notify the treasurer and 'delete' the member
            const obj = {};
            const now = moment().format();
            obj.updated = now;
            obj.deleted = true;
            obj.welcomeEmailSent = false;
            obj.access_codes = []; // wipe out the user's access codes

            return db.updateDocument('authbox', 'Members', { email: memberEmail }, obj)
              .then(() => {
                if(memberEmail) {
                  return v1.sendExitEmail(memberEmail);
                } else {
                  console.log('Unable to send Exit email because no memberEmail was set');
                }
              });
          } else if('subscr_failed' === ipnContent.txn_type) {
            // notify the treasurer
            return v1.sendEmail('treasurer@ithacagenerator.org', '[Ithaca Generator] Payment Failed', `PayPal says payment failed for Member ${memberEmail}`);
          } else if(['subscr_payment', 'subscr_signup'].indexOf(ipnContent.txn_type) < 0) {
            // TODO: should subscr_modify be in this list ^^^ ?
            return v1.sendEmail('web@ithacagenerator.org', '[Ithaca Generator] Unexpected IPN', `Got unexpected PayPal IPN "${Content.txn_type}" for Member ${memberEmail}`);
          }
        }
      })
      .catch((err) => {
        console.log(`IPN member record update failed.`, err);
      });
  }
}

// app.get('/testnotifyurl/:notifyId', (req, res, next) => {
//   if(req.params.notifyId) {
//     ipnValidationHandler(null, {}, req);
//   }
// });

app.use('/', index);
app.use('/v1', v1);
app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../AngularApp/dist/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  console.error(err.mesage, err.stack);
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
