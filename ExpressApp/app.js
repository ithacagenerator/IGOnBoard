//jshint esversion: 8
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
const { generateCouponCode, expireCouponCode } = require('./routes/couponCodes');

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
app.use(express.static(path.join(__dirname, '../AngularApp/dist/igonboard')));

app.post('/notify/:notifyId?', (req, res, next) => {
  console.log('IPN INCOMING');
  console.log('BODY: ', JSON.stringify(req.body, null, 2));
  console.log('PARAMS: ', JSON.stringify(req.params, null, 2));
  console.log('QUERY: ', JSON.stringify(req.query, null, 2));

  // inspect the contents of the IPN to determine if it's something we should pass on to woocommerce or not
  let isMembershipRelated = false;

  // simple policy is if it's related to a subscription, we handle it here
  if (req.body.subscr_id) {
    isMembershipRelated = true;
  }

  if (isMembershipRelated) {
    ipn.validator(ipnValidationHandler, true)(req, res, next);
  } else {
    console.log('FORWARDING to wordpress site');
    res.redirect('https://ithacagenerator.org');
  }
});

async function ipnValidationHandler(err, ipnContent, req) {
  if (err) {
      console.error("IPN invalid", err);              // The IPN was invalid
  } else {
      console.log(`Incoming IPN: `, ipnContent, req.params); // The IPN was valid.
      let memberEmail;
      const query = {$or: [
        { "paypal.subscr_id": ipnContent.subscr_id }
      ]};

      const update = {
        $push: { paypal: ipnContent },
        $set: {
          "registration.registrationComplete": true
        }
      };

      if (req.params.notifyId) {
        query.$or.push({ "registration.notifyId": req.params.notifyId });
        update.$set["registration.notifyId"] = req.params.notifyId;
      }

      const existingMembers = await db.findDocuments('authbox', 'Members', query);

      if (!Array.isArray(existingMembers)) {
        console.error('Failed to get an array back from ', JSON.stringify(query, null, 2));
        return;
      }

      if (existingMembers.length !== 1) {
        console.error(`Failed to get exactly 1 result (got ${existingMembers.length}) back from `, JSON.stringify(query, null, 2));
        return;
      }

      let isSignup = ['subscr_signup'].includes(ipnContent.txn_type);

      if (isSignup) {
        if (!Array.isArray(existingMembers[0].coupons) || !existingMembers[0].coupons.find(v => v.type === 'core')) {
          const code = await generateCouponCode(existingMembers[0].name);
          update.$push.coupons = { type: 'core', code };
        }
      }

      db.updateDocument('authbox', 'Members', query, update, { updateType: 'complex' }) // bind the paypal data to the member
      .then((result) => {
        console.log(`IPN modified ${result.modifiedCount} member records.`);
        if(result.matchedCount === 1) {
          // find the member's email, and if called for send a welcome email
          return db.findDocuments('authbox', 'Members', query)
          .then((members) => {
            if (members && members[0] && members[0].email) {
              memberEmail = members[0].email;
              if (isSignup) {
                return v1.sendWelcomeEmail(members[0].email) // send the new member welcome email to this person
                .then(() => {
                  return db.updateDocument('authbox', 'Members', query, { welcomeEmailSent: true });
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
      .then(async () => {
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
          if([ // 'subscr_cancel'
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
            obj.coupons = [];
            let member = {};
            // invalidate all their coupon codes by setting the expiry to yesterday
            try {
              const members = await db.findDocuments('authbox', 'Members', { email: memberEmail});
              if (!Array.isArray(members)) {
                console.error(`members is not an array in membership canceled ipn for ${memberEmail}`);
              } else if (members.length !== 1) {
                console.error(`members length is not 1 for ${memberEmail} (was ${members.length}) in membership canceled ipn`);
              } else {
                member = members[0];
                if (Array.isArray(member.coupons)) {
                  for (let jj = 0; jj < member.coupons.length; jj++) {
                    const code = member.coupons[jj].code;
                    await expireCouponCode(code);
                  }
                }
              }
            } catch(e) {
              console.error(e);
            }

            // members who upgrade or downgrade their membership generally do so by
            // (1) Canceling their existing subscription (generating a subscr_cancel)
            // (2) Then re-joining  under a new subscription (generating a subscr_signup / subscr_payment)
            // ... but then sometime later, when their original subscription term ends based on its term (which at this time is 1 month)
            //     (3) Paypal sends a subscr_eot... so history needs to be considered when deciding
            //         whether or not a subscr_eot is genuinely a termination of membership
            //         By my reasoning, if the previous thing to have happened prior to a subscr_eot
            //         was a subscr_payment, the eot can reasonably be ignored (as the lapse of a replaced subscription)
            //
            //         ... if we supported fixed-term subscriptions, this might be ambiguous
            //             one other way of looking at this is that we should _only_ terminate
            //             a membership based on subscr_eot
            if (ipnContent.txn_type === 'subscr_eot') {
              // consider the most recent paypal transaction from the member before now
              const mostRecentPaypalTxn = (member.paypal || [{}]).slice (-1)[0];
              if (mostRecentPaypalTxn.txn_type === 'subscr_payment') {
                return; // don't go through with terminating the member
              }
            }

            const [member] = db.findDocuments('authbox', 'Members', { email: memberEmail });

            return db.updateDocument('authbox', 'Members', { email: memberEmail }, obj)
              .then(() => {
                if(memberEmail) {
                  return v1.sendExitEmail(member);
                } else {
                  console.log('Unable to send Exit email because no memberEmail was set');
                }
              });
          } else if('subscr_failed' === ipnContent.txn_type) {
            // notify the treasurer
            return v1.sendEmail('treasurer@ithacagenerator.org', '[Ithaca Generator] Payment Failed', `PayPal says payment failed for Member ${memberEmail} ${member.name}`);
          } else if(['subscr_payment', 'subscr_signup'].indexOf(ipnContent.txn_type) < 0) {
            // TODO: should subscr_modify be in this list ^^^ ?
            return v1.sendEmail('web@ithacagenerator.org', '[Ithaca Generator] Unexpected IPN', `Got unexpected PayPal IPN "${Content.txn_type}" for Member ${memberEmail} ${member.name}`);
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
  res.sendFile(path.join(__dirname, '../AngularApp/dist/igonboard/index.html'));
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
