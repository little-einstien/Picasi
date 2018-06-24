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
const config = require('../config/config');
var mongodb = require('../app/mongo');
const Joi = require('joi');
const enc = require('../app/enc');
var jwt = require('jsonwebtoken');
const schema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

router.post('/login', function (req, res) {
    
    let validationResult = validateUser(req.body);
    if (validationResult.error) {
        return res.status(400).send(validationResult.error.details[0].message);
    }

    let credentials = {username  :req.body.username,password:req.body.password};
    isValidCredentials(credentials).then((isValid) => {
        if(isValid){
            res.send({status:SUCCESS,token:jwt.sign({
                data:credentials.username,
                pid:  'f7W18EB', 
                exp: Math.floor(Date.now() / 1000) + (60 * 60)
              }, config.auth.skey)});
        }else{
            res.send({status:FAILURE,msg:"Invalid user id password combination"});
        }
    });
});

router.get('/p/:pid', function (req, res) {
    getUserdetails(req.params.pid).then((data) => {
        return res.json(data);
    });
});

function isValidCredentials(credentials) {
    return new Promise(function (resolve, reject) {
        console.log(config.mongo.db);
        mongodb.get().db(config.mongo.db).collection(config.mongo.users_col).find(credentials).toArray(function (err, result) {
            console.log(result);
            if (err) {
                console.log(err);
                reject(false);
            }
            else if (result && result.length != 0) {
                resolve(true);
            }else{
                resolve(false);
            }
        });
    });
}
function getUserdetails(pid) {
    return new Promise(function (resolve, reject) {
        console.log(config.mongo.db);
        mongodb.get().db(config.mongo.db).collection(config.mongo.users_col).find({pid : pid},{ fields:{username:1,_id:0}}).toArray(function (err, result) {
            console.log(result);
            if (err) {
                console.log(err);
                reject(err);
            }
            else if (result && result.length != 0) {
                resolve({status:SUCCESS , data : result});
            }else{
                reject({status:FAILURE , data : []});
            }
        });
    });
}
function getUserdetailsByUN(un) {
    return new Promise(function (resolve, reject) {
        console.log(config.mongo.db);
        mongodb.get().db(config.mongo.db).collection(config.mongo.users_col).find({username:un},{ fields:{username:1,_id:0}}).toArray(function (err, result) {
            console.log(result);
            if (err) {
                console.log(err);
                reject(err);
            }
            else if (result && result.length != 0) {
                resolve({status:SUCCESS , data : result});
            }else{
                reject({status:FAILURE , data : []});
            }
        });
    });
}
function validateUser(project) {
    return Joi.validate(project, schema);
}

module.exports = router;
