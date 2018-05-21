var express = require('express');
var router = express.Router();
var path = require('path');
var randomstring = require("randomstring");
const fs = require('fs');
// const CHATBOT_DATA_DIR = "Projects/chatbots";
const CHATBOT_DATA_DIR = "chatbots";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Chatbot'
  });
});
router.get('/chatbot', function(req, res, next) {
  res.render('chatbot', {
    title: 'Chatbot'
  });
});
router.get('/trainer', function(req, res, next) {
  res.render('trainer', {
    title: 'trainer'
  });
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
    dbo.collection("resp").findOne({
      "intent": req.body.intent
    }, function(err, result) {
      if (err) throw err;
      console.log({
        "intent": req.body.intent
      });
      res.send(result);
      db.close();
    });
  });
});
router.get('/getintents/:project', function(req, res, next) {
  let project = req.params.project.trim();
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("training_data_" + project).find({}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});
router.get('/getprojects', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("project").find({}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});
router.post('/createproject', function(req, res, next) {
  var project = {
    name: req.body.nickname,
    tts: req.body.tts,
    stt: req.body.stt,
    id:randomstring.generate(7),
    updated_tm: new Date(),
    created_tm: new Date(),
    created_by : ''
  }
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("project").insertOne(project, function(err, result) {
      if (err) throw err;
      res.send(result);
      mkDirByPathSync(CHATBOT_DATA_DIR+'\\'+project.id);
      db.close();
    });
  });
});
router.get('/getintentdetails/:projectid/:intent', function(req, res, next) {
  var intent = req.params.intent.trim();
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("training_data_"+req.params.projectid).findOne({
      "intent": intent
    }, function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});
router.get('/cookie', function(req, res) {
  res.cookie('cid', randomstring.generate(7)).send('Cookie is set');
});
router.get('/chkusr', function(req, res) {
  console.log("Cookies :  ", req.cookies.cid);
  var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid : null : null;
  if (cookie) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      //Find the first document in the customers collection:
      dbo.collection("registration").findOne({
        "cid": cookie
      }, function(err, result) {
        if (err) throw err;
        if (result) {
          console.log(result);
          db.close();
          res.send("1");

        } else {
          res.cookie('cid', randomstring.generate(7)).send('0');

        }

      });
    });
  } else {
    res.cookie('cid', randomstring.generate(7)).send('Cookie is set');
    res.send(0);
  }
});

router.post('/register', function(req, res) {
  console.log("Cookies :  ", req.cookies.cid);
  var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid : null : null;
  if (cookie) {
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

router.post('/saveintent', function(req, res) {
  console.log("Old intent" + req.body.old_intent);
  console.log("Updated intent" + req.body.updated_intent);
  if (req.body.old_intent) {
    saveIntent(req.body).then(function(response) {
      res.send(response);
    });
  } else {
    saveNewIntent(req.body).then(function(response) {
      res.send(response);
    });
  }

  console.log();
  console.log(req.body.updated_intent);
  console.log(req.body.responses);
  console.log(req.body.texts);
});

function saveNewIntent(data) {
  console.log("Saving new intent");
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      dbo.collection("training_data_"+data.proj_id).insert({
        intent: data.updated_intent,
        text: data.texts,
        response: data.responses,
        'updated_by': '',
        'created_tm': new Date(),
        'updated_tm': new Date()
      }, function(err, result) {
        if (err) reject(err);
        db.close();
        resolve("1");
      });
    });
  });
}

function saveIntent(data) {
  console.log("updating intent");
  console.log(data.old_intent.length);
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      let where = {
        'intent': data.old_intent.trim()
      };
      let details = {
        '$set': {
          'intent': data.updated_intent.trim(),
          'text': data.texts,
          'response': data.responses,
          'updated_by': '',
          'updated_tm': new Date()
        }
      };
      dbo.collection("training_data_"+data.proj_id).updateOne(where, details, function(err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        db.close();
        //console.log(result);
        resolve("1");
      });
    });
  });
}

router.post('/log', function(req, res) {
  if (req.body.sender === 'user') {
    var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid : null : null;
    var username = getLoggedinUsername(cookie);
    req.body.sender = username;
  }

  var chatId = req.body.chatId ? req.body.chatId : randomstring.generate(10);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("chat_logs").update({
      chatId: chatId
    }, {
      $push: {
        chat: {
          'sender': req.body.sender,
          'msg': req.body.msg,
          'tm': new Date()
        }
      }
    }, {
      upsert: true,
      safe: false
    }, function(err, result) {
      if (err) throw err;
      db.close();
      res.send(chatId);
    });
  });
});

function getLoggedinUsername(cookie) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("registration").findOne({
      "cid": cookie
    }, function(err, result) {
      if (err) throw err;
      if (result) {
        console.log(result);
        db.close();
        return result.name;

      } else {
        return '';

      }
    });
  });
}
function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir =  'F:/' ;
  console.log(targetDir.split(sep));
  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
      console.log(`Directory ${curDir} created!`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }

      console.log(`Directory ${curDir} already exists!`);
    }

    return curDir;
  }, initDir);
}
module.exports = router;
