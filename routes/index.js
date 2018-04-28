var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chatbot' });
});
router.get('/chatbot', function(req, res, next) {
  res.render('chatbot', { title: 'Chatbot' });
});
module.exports = router;
