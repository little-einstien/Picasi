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

const schema = Joi.object().keys({
    pid: Joi.string().max(150).required(),
    flow: Joi.object().required(),
    sp: Joi.string().required()
})

/**
 * Get all projects
 */
router.get('/:pid', function (req, res) {
    let pid = req.params.pid;
    findFow({ "pid": pid }).then((projects) => {
        res.json(projects);
    });
});
/**
 * Create new flow
 */
router.post('/:pid', function (req, res) {
    //validate param

    let validationResult = validateFlow(req.body);
    if (validationResult.error) {
        return res.status(400).send(validationResult.error.details[0].message);
    }

    //create new project
    let flow = { $set: {} };
    flow.$set.pid = req.params.pid;
    flow.$set.sp = req.body.sp;
    flow.$set.status = 1;
    flow.$set.flow = req.body.flow;

    let params = { pid: req.body.pid };
    console.log(params);
    saveFlow(params, flow).then((result) => {
        return res.send(result);
    });
});
router.put('/:pid', function (req, res) {
    let pid = req.params.pid;
    // findFow({ "pid": pid }).then((result) => {
    //     if(result.status == FAILURE){
    //     return res.status(404).send('Project not exist');
    //     }
    // });

    //validate param
    let validationResult = validateFlow(req.body);
    if (validationResult.error) {
        return res.status(400).send(validationResult.error.details[0].message);
    }

    //create new project
    let flow = { $set: {} };
    flow.$set.pid = pid;
    flow.$set.sp = req.body.sp;
    flow.$set.status = 1;
    flow.$set.flow = req.body.flow;

    let params = { pid: req.body.pid };
    console.log(params);
    saveFlow(params, flow).then((result) => {
        return res.send(result);
    });
});

router.delete('/:id', function (req, res) {
    console.log(req.body);
    //validate param
    let validationResult = validateFlow(req.body);
    if (validationResult.error) {
        console.log(validationResult)
        return res.status(400).send(validationResult.error.details[0].message);
    }

    //create new project
    let id = req.body.id;
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
    findFow(params).then((result) => {
        if (result.status == FAILURE) {
            return res.status(404).send(`Project does not exists with id ${params.id} `)
        } else {
            saveProject({ $set: project }, params).then((result) => {
                return res.send(project);
            });
        }
    });

});




function findFow(params) {
    console.log(`checking flow of project = ${params.pid}`);

    return new Promise(function (resolve, reject) {
        let where = {};
        if (params) {
            params.status = 1;
        }
        console.log(params);

        mongodb.get().db(config.mongo.db).collection(config.mongo.training_flow_col).find(params).toArray(function (err, result) {
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

function saveFlow(where, data) {
    console.log("Going to save flow");
    console.log(where);
    console.log(JSON.stringify(data));
    return new Promise(function (resolve, reject) {
        let db = mongodb.get().db(config.mongo.db);
        //Find the first document in the customers collection:
        db.collection(config.mongo.training_flow_col).update(where, data, { upsert: true, safe: true }, function (err, result) {
            if (err) {
                console.log(err)
                reject({ status: FAILURE });
            }
            resolve({ status: SUCCESS, data: data });
        });
    });
}
function validateFlow(project) {
    return Joi.validate(project, schema);
}

function createProject(project) {
    project.created_date = new Date();
    project.updated_date = new Date();
    project.status = 1;
    return new Promise(function (resolve, reject) {
        let db = mongodb.get().db(config.mongo.db);
        //Find the first document in the customers collection:
        db.collection(config.mongo.project_col).insertOne(project, function (err, result) {
            if (err) {
                throw err;
                reject({ status: FAILURE })
            } else {
                resolve({ status: SUCCESS });
                mkDirByPathSync(`${CHATBOT_DATA_DIR}\\${project.id}`);
            }
        });
    });
}
function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = 'F:/';
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