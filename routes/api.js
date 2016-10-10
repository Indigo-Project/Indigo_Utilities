var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("local api");
});

router.get('/upload-csv', function(req, res, next) {
  res.send("upload csv");
});

module.exports = router;
