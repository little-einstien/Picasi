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

/**
 * Get all projects
 */
router.get('/projects', function (req, res) {
    findProjectById().then((projects) => {
        res.json(projects);
    });
});
/**
 * Get Project with specified id
 */
router.get('/projects/:id', function (req, res) {
    //validate id exists or not
    let id = req.params.id;
    findProjectById(id).then((projects) => {
        res.json(projects);
    });
});
/**
 * Create new project
 */
router.post('/projects', function (req, res) {
    //validate param

    //create new project
    res.send("project created");
});
router.put('/projects/:id', function (req, res) {
    //check project exists

    //validate params

    //update
    res.send(`project with id = ${req.params.id} updated`);
});

router.delete('/projects/:id', function (req, res) {
    //check project exists

    //validate params

    //update
    res.send(`project with id = ${req.params.id} deleted`);
});




function findProjectById(id) {
    console.log(`checking project with id = ${id}`);
    return new Promise(function (resolve, reject) {
        let where = {};
        if (id) {
            where.id = id
            where.status = 1
        }
        mongodb.get.collection("project").findOne(where, function (err, result) {
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
}

module.exports  =  router;