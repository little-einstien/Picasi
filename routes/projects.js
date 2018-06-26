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
    name: Joi.string().max(150).required(),
    status:Joi.number().optional(),
    id:Joi.string().allow('').optional(),
    tts: Joi.boolean().required(),
    stt: Joi.boolean().required(),
    h_clr:Joi.string().required(),
    bg_clr:Joi.string().required(),
    ucb_clr:Joi.string().required(),
    bcb_clr:Joi.string().required(),
    header:Joi.string().max(50).required()
})

/**
 * Get all projects
 */
router.get('/', function (req, res) {
    findProjectById().then((projects) => {
        res.json(projects);
    });
});
/**
 * Get Project with specified id
 */
router.get('/:param', function (req, res) {
    //validate id exists or not
    let name_regex = new RegExp(`^${req.params.param}\$`, 'i');
    params = { $or: [{ id: req.params.param }, { name: name_regex }] };
console.log(params)   
 findProjectById(params).then((projects) => {
        res.json(projects);
    });
});
/**
 * Create new project
 */
router.post('/', function (req, res) {
    //validate param

    let validationResult = validateProject(req.body);
    if (validationResult.error) {
        return res.status(400).send(validationResult.error.details[0].message);
    }

    //create new project
    let name = req.body.name.trim();
    let name_regex = new RegExp(`^${name}\$`, 'i');
    let params = { name: name_regex };
    let project = {};
    project.name = req.body.name;
    project.tts = req.body.tts;
    project.stt = req.body.stt;
    project.bg_clr = req.body.bg_clr;
    project.h_clr = req.body.h_clr;
    project.ucb_clr = req.body.ucb_clr;
    project.bcb_clr = req.body.bcb_clr;
    project.header = req.body.header;
    project.id = enc.generateHash(project.name);
    console.log(params);
    findProjectById(params).then((result) => {
        if (result.status == FAILURE) {
            createProject(project).then((project) => {
                return res.send(project);
            });
        } else {
            // if project allready created discard the request
            return res.status(400).send('project allready there !');
        }
    });
});
router.put('/:id', function (req, res) {
    console.log(req.body);
    //validate param
    // let validationResult = validateProject(req.body);
    // if (validationResult.error) {
    //     console.log(validationResult)
    //     return res.status(400).send(validationResult.error.details[0].message);
    // }

    //create new project
    let id = req.params.id;
    // let name_regex = new RegExp(`^${name}\$`, 'i');
    let params = {};
    params.id = id;
    let project = {};
    project.name = req.body.name;
    project.tts = req.body.tts;
    project.stt = req.body.stt;
    project.bg_clr = req.body.bg_clr;
    project.h_clr = req.body.h_clr;
    project.ucb_clr = req.body.ucb_clr;
    project.bcb_clr = req.body.bcb_clr;
    project.header = req.body.header;

    // project.id = enc.generateHash(project.name);
    console.log(params);
    findProjectById(params).then((result) => {
        if (result.status == FAILURE) {
            return res.status(404).send(`Project does not exists with id ${params.id} `)
        } else {
            saveProject({ $set: project }, params).then((result) => {
                return res.send(project);
            });
        }
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
    findProjectById(params).then((result) => {
        if (result.status == FAILURE) {
            return res.status(404).send(`Project does not exists with id ${params.id} `)
        } else {
            saveProject({ $set: project }, params).then((result) => {
                return res.send(project);
            });
        }
    });

});

function findProjectById(params) {
    // console.log(`checking project with id = ${params}`);
    return new Promise(function (resolve, reject) {
        let where = {};
        if (params) {
            params.status = 1;
        }
        console.log(config.mongo.db);

        mongodb.get().db(config.mongo.db).collection(config.mongo.project_col).find(params,{fields:{_id: 0,u_name:0,updated_tm:0,created_date:0,updated_date:0,status:0}}).toArray(function (err, result) {
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
                mkDirByPathSync(`${CHATBOT_DATA_DIR}/${project.id}`);
            }
        });
    });
}
function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
//     const baseDir = 'F:/';
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
