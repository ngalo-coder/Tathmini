var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({
    message: 'Users route is working',
    status: 'success'
  });
});

module.exports = router;
