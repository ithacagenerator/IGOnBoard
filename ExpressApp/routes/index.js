var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('executing index route');
  res.redirect('index.html');
});

module.exports = router;
