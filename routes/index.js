var express = require('express');
var router = express.Router();
var path = require('path');
var randomstring = require("randomstring");
const fs = require('fs');
// const CHATBOT_DATA_DIR = "Projects/chatbots";
const CHATBOT_DATA_DIR = "chatbots";
const FAILURE = "failure";
const SUCCESS = "success";
const MAX_RECORD_PERPAGE = 10;
var contentDisposition = require('content-disposition')
router.get('/downloadtandc', function (req, res) {
  var filePath = '/home/einstien0001/Arnav/Picasi/public/Appointments.pdf';
  res.setHeader('Content-disposition', 'attachment; filename=appointment.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  var stream = fs.createReadStream(filePath)
console.log('Befor stream');
try{    
stream.pipe(res)
}catch(err){
	console.log(err);
}
console.log('After stream')
});


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Chatbot'
  });
});
router.get('/chatbot', function (req, res, next) {
  res.render('chatbot', {
    title: 'Chatbot'
  });
});
router.get('/trainer', function (req, res, next) {
  res.render('trainer', {
    title: 'trainer'
  });
});
router.get('/reporting', function (req, res, next) {
  res.sendfile(path.resolve(__dirname + '/../public/sbadmin/pages/index.html'));
})

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
router.post('/getres', function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("demo");
    //Find the first document in the customers collection:
    dbo.collection("resp").findOne({
      "intent": req.body.intent
    }, function (err, result) {
      if (err) throw err;
      console.log({
        "intent": req.body.intent
      });
      res.send(result);
      db.close();
    });
  });
});
router.get('/getintents/:project/:pageno', function (req, res, next) {
  let pid = req.params.project.trim();
  let pno = parseInt(req.params.pageno.trim());
  console.log(pid +  "  ------ "+ pno);
  getIntents(pid,pno).then(result =>{
    res.json(result);
  })
});
function getIntents(pid, pno) {
  return new Promise(function (resolve, reject) {
    let _db = "chatbot_nlu_training";
    let _col = "training_data_" + pid;
    let where  = { "status": 1 };

    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(_db);
      let col =dbo.collection(_col);
      col.find(where).limit(MAX_RECORD_PERPAGE).skip((pno-1)*MAX_RECORD_PERPAGE).toArray(function (err, result) {
        if (err) throw err;
        if(pno ==1){
          getCount(_db,_col,where).then(count =>{
            resolve({'data': result,'count':count});
          });

        }else{
          resolve({'data' : result});
        }
        db.close();
      });
    });
  });
}

function getCount(_db,_col,q){
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db(_db);
      dbo.collection(_col).find(q).toArray(function (err, result) {
        if (err){
          console.log(err);
          resolve(0);
        };
        resolve(result.length);
        db.close();
      });
    });
  });
}


router.get('/getprojects', function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("project").find({ "status": 1 }).toArray(function (err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});
router.post('/createproject', function (req, res, next) {
  var project = {
    name: req.body.nickname,
    tts: req.body.tts,
    u_name: req.body.nickname.trim().toUpperCase(),
    stt: req.body.stt,
    id: randomstring.generate(7),
    status: 1,
    updated_tm: new Date(),
    created_tm: new Date(),
    created_by: ''
  }
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("project").insertOne(project, function (err, result) {
      if (err) throw err;
      res.send({'pid':project.id});
      mkDirByPathSync(CHATBOT_DATA_DIR + '\\' + project.id);
      db.close();
    });
  });
});
router.post('/saveproject', function (req, res, next) {
  let project = {
    '$set': {
      name: req.body.name,
      tts: req.body.tts,
      u_name: req.body.name.trim().toUpperCase(),
      stt: req.body.stt,
      id: req.body.id,
      status: req.body.status,
      updated_tm: new Date()
    }
  }
  let where = { id: req.body.id }
  saveProject(project, where).then((response) => {
    res.send(response);
  });
});

router.post('/delproject', function (req, res, next) {
  let project = {
    '$set': {
      status: 0,
      updated_tm: new Date()
    }
  }
  let where = { id: req.body.id }
  saveProject(project, where).then((response) => {
    res.send(response);
  });
});

function saveProject(data, where) {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      //Find the first document in the customers collection:
      dbo.collection("project").update(where, data, { upsert: true, safe: false }, function (err, result) {
        if (err) throw err;
        resolve(result);
        //mkDirByPathSync(CHATBOT_DATA_DIR + '\\' + project.id);
        db.close();
      });
    });
  });
}




router.get('/getintentdetails/:projectid/:intent', function (req, res, next) {
  var intent = req.params.intent.trim();
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("training_data_" + req.params.projectid).findOne({
      "intent": intent
    }, function (err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });
  });
});
router.get('/cookie', function (req, res) {
  res.cookie('cid', randomstring.generate(7)).send('Cookie is set');
});
router.get('/chkusr', function (req, res) {
  console.log("Cookies :  ", req.cookies.cid);
  var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid : null : null;
  if (cookie) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      //Find the first document in the customers collection:
      dbo.collection("registration").findOne({
        "cid": cookie
      }, function (err, result) {
        if (err) throw err;
        if (result) {
          console.log(result);
          db.close();
          res.send({data : "1"});

        } else {
          res.cookie('cid', randomstring.generate(7)).send({data : '0'});

        }

      });
    });
  } else {
    res.cookie('cid', randomstring.generate(7)).send({data : '0'});
  }
});

router.post('/register', function (req, res) {
  console.log("Cookies :  ", req.cookies.cid);
  var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid : null : null;
  if (cookie) {
    req.body['cid'] = cookie;
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      //Find the first document in the customers collection:
      dbo.collection("registration").insertOne(req.body, function (err, result) {
        if (err) throw err;
        db.close();
        res.send("1");

      });
    });
  }
});

router.post('/saveintent', function (req, res) {
  console.log("Old intent" + req.body.old_intent);
  console.log("Updated intent" + req.body.updated_intent);
  if (req.body.old_intent) {
    saveIntent(req.body).then(function (response) {
      res.send(response);
    });
  } else {
    saveNewIntent(req.body).then(function (response) {
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
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      dbo.collection("training_data_" + data.proj_id).insert({
        intent: data.updated_intent,
        u_intent: data.updated_intent.trim().toUpperCase(),
        text: data.texts,
        response: data.responses,
        'updated_by': data.updated_by,
        'status': 1,
        'created_tm': new Date(),
        'updated_tm': new Date()
      }, function (err, result) {
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
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      let where = {
        'intent': data.old_intent.trim(),
        'status': 1
      };
      let details = {
        '$set': {
          'intent': data.updated_intent.trim(),
          'u_intent': data.updated_intent.trim().toUpperCase(),
          'text': data.texts,
          'status': 1,
          'response': data.responses,
          'updated_by': '',
          'updated_tm': new Date()
        }
      };
      dbo.collection("training_data_" + data.proj_id).updateOne(where, details, function (err, result) {
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
router.get('/isintentexists/:projectid/:intent', function (req, res) {
  if (req.params.intent) {
    isIntentExists({ intent: req.params.intent, projectid: req.params.projectid }).then(function (result) {
      res.send(result);
    });
  }
});
router.get('/isprojectexists/:project', function (req, res) {
  if (req.params.project) {
    isProjectExists({ project: req.params.project }).then(function (result) {
      res.json(result);
    });
  } else {
    res.json({ status: FAILURE });
  }
});
router.post('/getprojectdetails', function (req, res) {
  let pid = req.body.pid;
  console.log('fetching details of ' + pid);
  if (pid) {
    findProjectById(pid).then(function (result) {
      res.json(result);
    });
  } else {
    res.json({ status: FAILURE });
  }
});

function isIntentExists(data) {
  console.log("checking intent");
  console.log(data.intent);
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      let where = {
        'u_intent': data.intent.trim().toUpperCase(),
        'status': 1
      };

      dbo.collection("training_data_" + data.projectid).findOne(where, function (err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        db.close();
        if (result) {
          resolve(result);
        } else {
          resolve("0");
        }
      });
    });
  });
}

function isProjectExists(data) {
  console.log("checking project");
  console.log(data.project);
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      let where = {
        'u_name': data.project.trim().toUpperCase(),
        'status': 1
      };

      dbo.collection("project").findOne(where, function (err, result) {
        if (err) {
          console.log(err);
          reject({ status: FAILURE });
        }
        db.close();
        if (result) {
          resolve({ status: SUCCESS, data: result });
        } else {
          resolve({ status: FAILURE, data: {} });
        }
      });
    });
  });
}
function findProjectById(id) {
  console.log("checking project");
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      var dbo = db.db("chatbot_nlu_training");
      let where = {
        'id': id,
        'status': 1
      };

      dbo.collection("project").findOne(where, function (err, result) {
        if (err) {
          console.log(err);
          reject({ status: FAILURE });
        }
        db.close();
        if (result) {
          resolve({ status: SUCCESS, data: result });
        } else {
          resolve({ status: FAILURE, data: {} });
        }
      });
    });
  });
}

router.post('/log', function (req, res) {
  if (req.body.sender === 'user') {
    var cookie = req.cookies ? req.cookies.cid ? req.cookies.cid : null : null;
    var username = getLoggedinUsername(cookie);
    req.body.sender = username;
  }

  var chatId = req.body.chatId ? req.body.chatId : randomstring.generate(10);
  MongoClient.connect(url, function (err, db) {
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
      }, function (err, result) {
        if (err) throw err;
        db.close();
        res.send(chatId);
      });
  });
});

function getLoggedinUsername(cookie) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("chatbot_nlu_training");
    //Find the first document in the customers collection:
    dbo.collection("registration").findOne({
      "cid": cookie
    }, function (err, result) {
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
function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
//   const baseDir = '/home/g101demoid/Arnav';
const baseDir = '/home/einstien0001/Arnav/NLU_backend';
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
router.post('/deleteintent', function (req, res) {
  console.log(req.body);
  if (req.body.intent) {
    deleteIntent(req.body.projectid, req.body.intent.trim()).then(function (data) {
      res.send(data);
    }).catch(function (err) {
      console.log(err);
    });;
  } else {
    res.send("1");
  }
});
function deleteIntent(projectid, intent) {
  console.log("deleteing intent");
  console.log(intent);
  return new Promise(function (resolve, reject) {
    MongoClient.connect(url, function (err, db) {
      if (err) {

        throw err;
      }
      var dbo = db.db("chatbot_nlu_training");
      console.log("after db");
      let where = {
        'intent': intent
      };
      console.log(where);
      let details = {
        '$set': {
          'status': 0,
          updated_tm: new Date()
        }
      };

      dbo.collection("training_data_" + projectid).updateOne(where, details, function (err, result) {
        if (err) {
          console.log(err);
          reject(err);
        }
        db.close();
        //console.log(result);
        resolve("1");
      });
    });
  })
}
module.exports = router;
