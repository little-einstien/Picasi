var config = {};
const DB = 'chatbot_nlu_training';
config.mongo = {};
config.redis = {};
config.web = {};
config.auth = {};
config.ENCRYPTION_KEY = 'aop3o9PqzJFWMxjyhA5MpqJs5rO63VUt' 

config.mongo.ip  = '127.0.0.1';
config.mongo.url  = 'mongodb://localhost:27017/';
config.mongo.port  = '27017';
config.mongo.db  = DB;
config.mongo.training_data_col  = 'training_data_';
config.mongo.training_flow_col  = 'training_flow';
config.mongo.project_col  = 'project';
config.mongo.appointment_col  = 'appointments';
config.mongo.users_col  = 'users';
config.mongo.slots_col  = 'slots';
config.mongo.forms_col  = 'forms';
config.auth.skey = 'oiYXJuYXYiLCJleHAiOjE1Mjk2MTc3MzIsImlhdCI6MTUy'













// config.default_stuff =  ['red','green','blue','apple','yellow','orange','politics'];




// config.twitter.user_name = process.env.TWITTER_USER || 'username';
// config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';
// config.redis.uri = process.env.DUOSTACK_DB_REDIS;
// config.redis.host = 'hostname';
// config.redis.port = 6379;
// config.web.port = process.env.WEB_PORT || 9980;

module.exports = config;
