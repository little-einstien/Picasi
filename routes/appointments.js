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
const nodemailer = require('nodemailer');
var accountSid = 'ACa3e4feae800a67dffe4fb9a30900a1141'; // Your Account SID from www.twilio.com/console
var authToken = 'fb1efc05ac983d59cc6b4e7e87b730be1';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);
const schema = Joi.object().keys({

    title: Joi.string().max(150).required(),
    st: Joi.date().required(),
    et: Joi.date().required(),
    remarks: Joi.string().required(),
    pid: Joi.string().required(),
    ap_with: Joi.string().required(),
    user: Joi.object().keys({ id: Joi.string().required(), name: Joi.string().required() }).required()
});

/**
 * Get all projects
 */
router.get('/', function (req, res) {
    getAppointments().then((projects) => {
        res.json(projects);
    });
});
/**
 * Get Project with specified id
 */
router.get('/:pid', function (req, res) {
    let params = {};
    let pid = req.params.pid;
    params.pid = pid;
    if (req.query.uid) {
        params['user.id'] = req.query.uid;
    }
    console.log(params);
    getAppointments(params).then((projects) => {
        res.json(projects);
    });
});
/**
 * Create new project
 */
router.post('/', function (req, res) {
    //validate param

    // let validationResult = validateProject(req.body);
    // if (validationResult.error) {
    //     return res.status(400).send(validationResult.error.details[0].message);
    // }

    //create new project

    let appointment = { user: {} };
    // appointment.title = req.body.title;
    // appointment.remarks = req.body.remarks;
    // appointment.st = req.body.st;
    appointment.date = req.body.date;
    appointment.slot = req.body.slot;
    // appointment.et = req.body.et;
    // appointment.fields = req.body.details;
    appointment.pid = req.body.pid;
    // appointment.ap_with = req.body.ap_with;
    appointment.c_dt = new Date();
    appointment.u_dt = new Date();
    appointment.user.id = req.body.user.id;
    appointment.user.name = req.body.user.name;
    appointment.user.mobile = req.body.user.mobile;
    appointment.user.email = req.body.user.email;
    createAppointment(appointment).then((appointment) => {
        client.messages.create({
            body: `<h1>Congratulation  ${appointment.user.name} ! your appointment booked</h1> <p><h3>Date : ${new Date(req.body.date).toUTCString()}</h3></p>
            <p><h3>Date : ${req.body.slot}</h3></p>
            `,
            to: '+919868460736',  // Text this number
            from: '+18577633055' // From a valid Twilio number
        }).then((message) => console.log(message.sid)).catch((err)=>{console.log(err)});
        nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                //port: 587,
                //secure: false, // true for 465, false for other ports
                auth: {
                    user: '101demoid@gmail.com', // generated ethereal user
                    pass: 'aliflaila@101' // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Doctor X" <doctorx@gmail.com>', // sender address
                to: req.body.user.email, // list of receivers
                subject: 'Hello ✔', // Subject line
                text: 'Hello world?', // plain text body
                html: `<h1>Congratulation  ${appointment.user.name} ! your appointment booked</h1> <p><h3>Date : ${new Date(req.body.date).toUTCString()}</h3></p>
                <p><h3>Date : ${req.body.slot}</h3></p>
                ` // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });

        return res.send(appointment);
    });
    // findProjectById(params).then((result) => {
    //     if (result.status == FAILURE) {
    //         createProject(appointment).then((project) => {
    //             return res.send(project);
    //         });
    //     } else {
    //         // if project allready created discard the request
    //         return res.status(400).send('project allready there !');
    //     }
    // });
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
    getAppointments(params).then((result) => {
        if (result.status == FAILURE) {
            return res.status(404).send(`Project does not exists with id ${params.id} `)
        } else {
            saveProject({ $set: project }, params).then((result) => {
                return res.send(project);
            });
        }
    });

});

function getAppointments(where) {
    // console.log(`checking project with id = ${params}`);
    return new Promise(function (resolve, reject) {
        // let where = {};
        // if (params) {
        //     params.status = 1;
        // }
        console.log(config.mongo.db);

        mongodb.get().db(config.mongo.db).collection(config.mongo.appointment_col).find(where).toArray(function (err, result) {
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

function createAppointment(appointment) {
    return new Promise(function (resolve, reject) {
        let db = mongodb.get().db(config.mongo.db);
        //Find the first document in the customers collection:
        db.collection(config.mongo.appointment_col).insertOne(appointment, function (err, result) {
            if (err) {
                throw err;
                reject(appointment)
            } else {
                resolve(appointment);
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
