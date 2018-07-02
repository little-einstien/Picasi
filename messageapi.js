var accountSid = 'AC5bae868c8eae3c9372d8b436388bd2a9'; 
var authToken = '471927ae4226ad691ef67c3145c03b87';   
var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

module.exports = {
	sendMessage : function(to,message){
		return new Promise((resolve,reject) => {
			client.messages.create({
				body: message,
				to: `+91${to}`,  // Text this number
				from: '+15732290658 ' // From a valid Twilio number
				}).then((message) => { 
					console.log(message.sid);
					resolve(message);
				}).catch((err)=>{	
					console.log(err);
					reject(err);
				});
		});	
	}
}
