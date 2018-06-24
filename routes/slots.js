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

    title: Joi.string().max(150).required(),
    st: Joi.date().required(),
    et: Joi.date().required(),
    remarks: Joi.string().required(),
    pid: Joi.string().required(),
    ap_with: Joi.string().required(),
    user: Joi.object().keys({ id: Joi.string().required(), name: Joi.string().required() }).required()
});

router.get('/:token', function (req, res) {
    let params = {};
    let token = req.params.token;
    jwt.verify(token, config.auth.skey, function (err, decoded) {
        if (err) {
            return res.status(403).send(err);
        }
        getSlots(decoded.data).then((slots) => {
            return res.json(slots);
        });
    });
});
router.post('/u/:un', function (req, res) {
    let un = req.params.un;
    let date = req.body.date;
    let params = {un : un};
    if(date){
        params.date = date;
    }
    // let token = req.params.token;
    // jwt.verify(token, config.auth.skey, function (err, decoded) {
    //     if (err) {
    //         return res.status(403).send(err);
    //     }
    getSlots(params).then((slots) => {
        return res.json(slots);
    });
});

router.get('/u/:un', function (req, res) {
    getSlots({un : req.params.un}).then((slots) => {
        return res.json(slots);
    });
});



router.post('/', function (req, res) {
    //validate param

    // let validationResult = validateProject(req.body);
    // if (validationResult.error) {
    //     return res.status(400).send(validationResult.error.details[0].message);
    // }
    console.log(req.body.token);
    jwt.verify(req.body.token, config.auth.skey, function (err, decoded) {
        if (err) {
            return res.status(403).send(err);
        }
        let slots = {};
        slots.m_slt = req.body.m_slts;
        slots.e_slt = req.body.e_slts;
        slots.date = req.body.date;
        
        slots.un = decoded.data;

        createSlots(slots).then((slots) => {
            return res.send(slots);
        });
    });
});
router.put('/:id', function (req, res) {
    console.log(req.body);
    //validate param
    /*let validationResult = validateProject(req.body);
    if (validationResult.error) {
        console.log(validationResult)
        return res.status(400).send(validationResult.error.details[0].message);
    }*/

    //create new project
    let id = req.params.id;
    // let name_regex = new RegExp(`^${name}\$`, 'i');


    let appointment = { user: {} };
    appointment.title = req.body.title;
    appointment.remarks = req.body.remarks;
    appointment.st = req.body.st;
    appointment.et = req.body.et;
    appointment.fields = req.body.fields;
    appointment.pid = req.body.pid;
    appointment.c_dt = new Date();
    appointment.u_dt = new Date();
    appointment.user.id = req.body.user.id;
    appointment.user.name = req.body.user.name;

    // project.id = enc.generateHash(project.name);
    // console.log(params);
    // findProjectById(params).then((result) => {
    //     if (result.status == FAILURE) {
    //         return res.status(404).send(`Project does not exists with id ${params.id} `)
    //     } else {
    //         saveProject({ $set: project }, params).then((result) => {
    //             return res.send(project);
    //         });
    //     }
    // });
    updateAppointment({}, appointment).then((appointment) => {
        return res.send(appointment);
    });
    //validate params

    //update
    // res.send(`project with id = ${req.params.id} updated`);
});

router.delete('/:id', function (req, res) {
    console.log(req.body);
    //validate param
    let validationResult = validateProject(req.body);
    if (validationResult.error) {
        console.log(validationResult)
        return res.status(400).send(validationResult.error.details[0].message);
    }

    //create new project
    let id = req.params.id;
    // let name_regex = new RegExp(`^${name}\$`, 'i');
    let params = {};
    params.id = id;
    let project = {};
    project.name = req.body.name;
    project.tts = req.body.tts;
    project.stt = req.body.stt;
    project.status = 0;

    // project.id = enc.generateHash(project.name);
    console.log(params);
    getSlots(params).then((result) => {
        if (result.status == FAILURE) {
            return res.status(404).send(`Project does not exists with id ${params.id} `)
        } else {
            saveProject({ $set: project }, params).then((result) => {
                return res.send(project);
            });
        }
    });

});

function getSlots(params) {
     console.log(`get slots for = ${params}`);
    return new Promise(function (resolve, reject) {
        // let where = {};
        // if (params) {
        //     params.status = 1;
        // }
        console.log(config.mongo.db);
        mongodb.get().db(config.mongo.db).collection(config.mongo.slots_col).find(params,{fields : {_id  : 0}}).toArray(function (err, result) {
            console.log(result);
            if (err) {
                console.log(err);
                reject({ status: FAILURE });
            }
            if (result && result.length != 0) {
                resolve({ status: SUCCESS, data: result });
            } else {
                resolve({ status: FAILURE, data: [] });
            }
        });
    });
}
function getUsersFromPid(pid) {
    return new Promise(function (resolve, reject) {
        console.log(config.mongo.db);
        mongodb.get().db(config.mongo.db).collection(config.mongo.users_col).find({ pid: pid, rid: 1 }).toArray(function (err, result) {
            console.log(result);
            if (err) {
                console.log(err);
                reject({ status: FAILURE });
            }
            if (result && result.length != 0) {
                resolve({ status: SUCCESS, data: result });
            } else {
                resolve({ status: FAILURE, data: {} });
            }
        });
    });
}
function validateProject(project) {
    return Joi.validate(project, schema);
}

function createSlots(slots) {
    return new Promise(function (resolve, reject) {
        let db = mongodb.get().db(config.mongo.db);
        //Find the first document in the customers collection:
        db.collection(config.mongo.slots_col).insertOne(slots, function (err, result) {
            if (err) {
                reject(slots)
                throw err;
            } else {
                resolve(slots);
            }
        });
    });
}

function updateAppointment(params, appointment) {
    return new Promise(function (resolve, reject) {
        let db = mongodb.get().db(config.mongo.db);
        //Find the first document in the customers collection:
        db.collection(config.mongo.appointment_col).update(params, appointment, function (err, result) {
            if (err) {
                throw err;
                reject(appointment)
            } else {
                resolve(appointment);
            }
        });
    });
}

function saveProject(project, where) {
    return new Promise(function (resolve, reject) {
        let db = mongodb.get().db(config.mongo.db);
        //Find the first document in the customers collection:
        db.collection(config.mongo.project_col).update(where, project, { upsert: true, safe: false }, function (err, result) {
            if (err) {
                reject({ status: FAILURE });
            }
            resolve({ status: SUCCESS, data: project });
        });
    });
}
module.exports = router;