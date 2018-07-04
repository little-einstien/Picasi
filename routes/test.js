var moment = require('moment-timezone');
var c = moment.tz(1535653800000, "Asia/Colombo");
console.log(c.format("MMM Do YYYY"));
