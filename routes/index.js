var express = require('express');
var router = express.Router();
var path = require('path');
var randomstring = require("randomstring");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Chatbot' });
});
router.get('/chatbot', function(req, res, next) {
  res.render('chatbot', { title: 'Chatbot' });
});
router.get('/trainer', function(req, res, next) {
  res.render('trainer', { title: 'trainer' });
});
router.get('/reporting', function(req, res, next) {
	res.sendfile(path.resolve(__dirname + '/../public/sbadmin/pages/index.html'));
})

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
router.post('/getres', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("demo");
	  //Find the first document in the customers collection:
	  dbo.collection("resp").findOne({"intent":req.body.intent}, function(err, result) {
		if (err) throw err;
		console.log({"intent":req.body.intent});
		res.send(result);
		db.close();
	  });
	});
});
router.get('/getintents', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("chatbot_nlu_training");
	  //Find the first document in the customers collection:
	  dbo.collection("trainig_data").distinct("intent",{}, function(err, result) {
		if (err) throw err;
		res.send(result);
		db.close();
	  });
	});
});
router.get('/getintentdetails/:intent', function(req, res, next) {
  var intent  = req.params.intent;
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("chatbot_nlu_training");
	  //Find the first document in the customers collection:
	  dbo.collection("trainig_data").findOne({"intent":intent}, function(err, result) {
		if (err) throw err;
		res.send(result);
		db.close();
	  });
	});
});
router.get('/cookie',function(req, res){
     res.cookie('cid' , randomstring.generate(7)).send('Cookie is set');
});
router.get('/chkusr',function(req, res){
     console.log("Cookies :  ", req.cookies.cid);
	 var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid :null : null;
	 if(cookie){
		 MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("chatbot_nlu_training");
		  //Find the first document in the customers collection:
		  dbo.collection("registration").findOne({"cid":cookie}, function(err, result) {
			if (err) throw err;
			if(result){
				console.log(result);
				db.close();
				res.send("1");

			}else{
				res.cookie('cid' , randomstring.generate(7)).send('0');

			}

		  });
		});
	 }else{
			res.cookie('cid' , randomstring.generate(7)).send('Cookie is set');
			res.send(0);
		}
});

router.post('/register',function(req, res){
     console.log("Cookies :  ", req.cookies.cid);
	 var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid :null : null;
	 if(cookie){
		 req.body['cid'] = cookie;
		 MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("chatbot_nlu_training");
		  //Find the first document in the customers collection:
		  dbo.collection("registration").insertOne(req.body, function(err, result) {
			if (err) throw err;
			db.close();
			res.send("1");

		  });
		});
	 }
});


router.post('/log',function(req, res){
	if(req.body.sender === 'user'){
		var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid :null : null;
		var username = getLoggedinUsername(cookie);
		req.body.sender = username;
	}

	var chatId = req.body.chatId ? req.body.chatId : randomstring.generate(10);
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("chatbot_nlu_training");
	  //Find the first document in the customers collection:
	dbo.collection("chat_logs").update({chatId: chatId},{$push:{chat : {'sender':req.body.sender,'msg':req.body.msg,'tm':new Date()}}},{upsert: true, safe: false}, function(err, result) {
		if (err) throw err;
		db.close();
		res.send(chatId);
	  });
	});
});

function getLoggedinUsername(cookie){
	MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("chatbot_nlu_training");
		  //Find the first document in the customers collection:
		  dbo.collection("registration").findOne({"cid":cookie}, function(err, result) {
			if (err) throw err;
			if(result){
				console.log(result);
				db.close();
				return result.name;

			}else{
				return '';

			}
		  });
		});
}
module.exports = router;
