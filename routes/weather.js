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
var request = require('request');
var apiKey = "5a763f161acc50200c6b2b15e8b678f5";

router.get('/:lat/:lon', function (req, res) {
    let lat = req.params.lat;
    let lon = req.params.lon;
    let city = 'noida';
    // request(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&&lon=${lon}&&APPID=${apiKey}`, function (error, response, body) {
    request(`http://api.openweathermap.org/data/2.5/weather?q=${city}&&APPID=${apiKey}`, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        res.json({status : SUCCESS , data : JSON.parse(body)});
    });
});
module.exports = router;
