var DEFAULT_WELCOME_MSG = "<p>Hi i am Sonia your <a href='https://www.ey.com/' target='_blank'><b>virtual Assistant</b></a>.How may i help you today?</p>";
var BOT_ICON = "/images/robot-icon.png";
var USER_ICON = "/images/user-icon.png";
var ACCESS_TOKEN = "212103e00ea54783ae97206ead265744";
var BASE_URL = "https://api.api.ai/v1/";
var automatedReplyGenerated = false;
var _projectId =  '';

//response types
var BUTTON = 'button';
var RATING = 'rating';
var crnt_display_msg = "";
var crnt_query_msg = "";33
var chat = [];
var conversation = []; //array that will hold the whole conversation

$(document).ready(function() {
	$("#input").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			sendMessage();
		}
	});
	//click event for recording button
	$("#rec").click(function(event) {
		switchRecognition();
	});

	//click event close button for closing iframe
	$('.custom-chatbot-close').click(function(){
		window.parent.$('.widget-toggle').removeClass('widget-toggle');
		window.parent.$('.chatbot-icon').show();
	});

	//TODO
	$("#input").on("keyup",function() {
	  $("#input_h").val($(this).val());
	});
});
var recognition;
var feedbackBtnFlag;
function sendAutomaticMessage(){
	send("feedback_get");
	feedbackBtnFlag = true;
}
function sendMessage(){
	automatedReplyGenerated = false;
	if(!isEmptyString($("#input_h").val())){
		conversation.push(getUserResponseAsHTML($("#input").val()));
		send($("#input_h").val());
		//send_dummy($("#input_h").val());
	}
	else if (isRated){
		//conversation.push(getUserResponseAsHTML($("#input_h").val()));
		setResponse();
	}else
		console.log("Empty Message");
}
function startRecognition() {
	recognition = new webkitSpeechRecognition();
	recognition.onstart = function(event) {
		updateRec();
	};
	recognition.onresult = function(event) {
		var text = "";
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			text += event.results[i][0].transcript;
		}
		setInput(text);
		stopRecognition();
	};
	recognition.onend = function() {
		stopRecognition();
	};
	recognition.lang = "en-US";
	recognition.start();
	$('#rec').html('<i class="fa fa-microphone" aria-hidden="true"></i>');
}

function stopRecognition() {
	if (recognition) {
		recognition.stop();
		recognition = null;
	}
	updateRec();
}
function switchRecognition() {
	if (recognition) {
		stopRecognition();
	} else {
		startRecognition();
	}
}
function setInput(text) {
	$("#input").val(text);
	send($("#input").val());
}
function updateRec() {
	$("#rec").html(recognition ? "Stop" : '<i class="fa fa-microphone" aria-hidden="true"></i>');
}
function getResponse(o){
	debugger;
	//o = JSON.parse(o
	if(!$("#sendIcon").attr('disabled')) {
		$("#input").val(o.text);
		$("#input_h").val(o.value);
	}
	//send($(query);
}

function send(text) {
	if(!isEmptyString(text)){
		$.ajax({
			type: "POST",
			url: BASE_URL + "query?v=20150910",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			headers: {
				"Authorization": "Bearer " + ACCESS_TOKEN
			},
			data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
			beforeSend: function() {
				$('#loader').css('display','inline-block');
			},
			success: function(data) {
				var msg = data.result.fulfillment.speech;
				var msgData = data.result.fulfillment.messages;
				var html = '';
				getHtml(msgData,function(data){
					html = data;
				});
				chat.push({"user" : text,"bot" : data.result.fulfillment.messages,"tm" : new Date()});
				//saveChat({"data" : chat,"id" : "1203"});
				conversation.push(html);
				setResponse(JSON.stringify(msg, undefined, 2));
				$('#loader').hide();
			},
			error: function() {
				setResponse("Internal Server Error");
			}
		});
		setResponse("Loading...");
	}
}
function setResponse() {
	$("#input").val('');
	$("#response").html(conversation.join(""));
	if(feedbackBtnFlag) {
		$('#feedback-btn').attr('disabled',true);
	}
	$('#response').scrollTop($('#response')[0].scrollHeight)
	// rating
	if(!isRated) {
		$( '.rating_c' ).ratingbar().click(function() {
			// Grab value
			var ratingGiven =  $(this ).attr( 'data-value' ) ;
			$("#input").val(ratingGiven + ' rating');
			var getHtml = $('#ratingSpan').html();
			if(ratingGiven <= 3)
				$("#input_h").val("bad_rating");
			else
				$("#input_h").val("gud_rating");
			conversation[conversation.length-1]=getHtml;
			$(".rating_c").off("mousemove");
			return false;
		});
	}else{
		$("#rateus").hide();
	}_idleSecondsCounter = 0;
	// tooltip
	$('[data-toggle="tooltip"]').tooltip();
}
var isRatingResp = false;

function getHtml(msgData,callback){

	var payload = {};
	var type = '';
	var h1 = '';
	var h2 = '';
	var m = '';
	for(k in msgData){
		if( msgData[k].type == 0 && msgData[k].speech.trim().length != 0){
			h1 += msgData[k].speech;
		}
		if(msgData[k].type == 4){
			payload = msgData[k].payload.data;
			type = msgData[k].payload.type;
			m = msgData[k].payload.msg;
			break;
		}
	}
	if(type == BUTTON ){
		isRatingResp = false;
		for(i in payload){
			h2 += "<button onclick='getResponse("+JSON.stringify(payload[i])+")' class='custom-btn-response "+payload[i].cls+"'  >"+payload[i].text+"</button>";
		}
	}else{
		callback("<div class='custom-text-wraper custom-response-boot'> "+ h1 +"</div>");
	}
	h2 = getBotResponseAsHTML("<p>"+h1 +"</p><p>"+ m +"</p><p>" + h2 +"</p>");
	callback(h2);

	//console.log(html);
}

// scroll bar
$('.scrollbox').enscroll();
var isRated = false
function rateUs(obj) {
	if(!isRated){
		conversation.push( "<div class='custom-msg-wrapper' id='ratingSpan'> <div class='col-xs-10 p-r-0'><span class='custom-text-wraper custom-response-boot'>" + RATING_HTML + "</span></div>" +"</div>");
		setResponse();
		isRated = true;
	}
	console.log(obj);
}




//This function will generate the html for message sent by bot
function getBotResponseAsHTML(msg){
	return "<div class='custom-msg-wrapper'> "+
						" <div class='col-xs-10 p-r-0 '> "+
							" <span class='custom-text-wraper custom-response-boot'> " +
									msg +
						" </div>" +
						" <div class='col-xs-2 p-l-0 p-r-0'> "+
							" <img src='"+BOT_ICON+"' class='img-responsive pull-right' alt='Bot' /> " +
						" </div> "+
					" </div>";
}

//This function will generate the html for message sent by user
function getUserResponseAsHTML(msg){
	return "<div class='custom-msg-wrapper'> "+
				"<div class='col-xs-2 p-r-0 p-l-2'> " +
					" <img src='"+USER_ICON+"' class='img-responsive pull-left' alt='User' /> "+
				"</div> "+
				"<div class='col-xs-10 p-l-0'> " +
					"<span class='custom-text-wraper custom-response-user bg-tiffanyblue'> "
					    +msg+
					"</span> "
				+"</div> " +
			" </div> ";
}
function isEmptyString(str){
	return str == undefined || str == null || str == '' || str.trim().length == 0;
}

window.addEventListener("message", messageHandler, false);

function messageHandler(event){
	if(event.data){
		if(event.data.method === 'hear'){
			hear(event.data.message);
		}if(event.data.method === 'register'){
				register(event.data.data.projectId);
		}
	}
}

function hear(message){
	var msg = getBotResponseAsHTML(message);
	conversation.push(msg);
	setResponse();
}
function register(projectId){
	_projectId = projectId
}
