var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
const config = require('../config/config');
var state = {
    db: null,
  }
  
  exports.connect = function(url, done) {
    if (state.db) return done()
  
    MongoClient.connect(url, function(err, db) {
      if (err) return done(err)
      state.db = db
      done()
    })
  }
  
  exports.get = function() {
    // console.log(state.db.db('chatbot_nlu_training').collection('projects'));
    return state.db
  }
  
  exports.close = function(done) {
    if (state.db) {
      state.db.close(function(err, result) {
        state.db = null
        state.mode = null
        done(err)
      })
    }
  }
