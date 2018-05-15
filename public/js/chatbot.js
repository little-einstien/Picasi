var DEFAULT_WELCOME_MSG = "<p>Hi i am Picasi your <b>virtual Assistant</b></p><p>How may i help you today?</p>";
var BOT_ICON = "/images/robot-icon.png";					
var USER_ICON = "/images/user-icon.png";					
var ACCESS_TOKEN = "212103e00ea54783ae97206ead265744";
var BASE_URL1= "http://localhost:3000/getres/";
var BASE_URL2 = "http://localhost:80/api/";
var automatedReplyGenerated = false;

//response types 
var BUTTON = 'button'; 
var RATING = 'rating';
var crnt_display_msg = "";
var crnt_query_msg = "";
var chat = [];
var conversation = []; //array that will hold the whole conversation

$(document).ready(function() {
	$("#input").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			sendMessage();
		}
	});
	//TODO
	$("#input").on("keyup",function() {
	  $("#input_h").val($(this).val());
	});
});

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
function setInput(text) {
	$("#input").val(text);
	send($("#input").val());
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

// function send(text) {
	// if(!isEmptyString(text)){
		// $.ajax({
			// type: "POST",
			// url: BASE_URL + "query?v=20150910",
			// contentType: "application/json; charset=utf-8",
			// dataType: "json",
			// headers: {
				// "Authorization": "Bearer " + ACCESS_TOKEN
			// },
			// data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
			// beforeSend: function() {  
				// $('#loader').css('display','inline-block');
			// },
			// success: function(data) {
				// var msg = data.result.fulfillment.speech;
				// var msgData = data.result.fulfillment.messages;
				// var html = '';
				// getHtml(msgData,function(data){
					// html = data;
				// });
				// chat.push({"user" : text,"bot" : data.result.fulfillment.messages,"tm" : new Date()});
				// //saveChat({"data" : chat,"id" : "1203"});
				// conversation.push(html);
				// setResponse(JSON.stringify(msg, undefined, 2));
				// $('#loader').hide();
			// },
			// error: function() {
				// setResponse("Internal Server Error");
			// }
		// });
		// setResponse("Loading...");
	// }
// }

function send(text) {
	logChat('user',text);
	if(!isEmptyString(text)){
		$.ajax({
			type: "GET",
			url: BASE_URL2 +text,
			//contentType: "application/json; charset=utf-8",
			dataType: "json",
			beforeSend: function() {  
				$('#loader').css('display','inline-block');
			},
			success: function(data) {
				var intent = data.intent.name;
				$.ajax({
					type: "POST",
					url: BASE_URL1,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: JSON.stringify({ intent: intent}),
					success: function(result) {
						speak(result.response);
						conversation.push(getBotResponseAsHTML(result.response));
						setResponse();
						$('#loader').hide();
						logChat('picasi',result.response);
					}
				})
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
	$('#response').scrollTop($('#response')[0].scrollHeight);
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
							"<a href='#modal1' class='modal-trigger'> <img src='"+BOT_ICON+"' class=' img-responsive pull-right' alt='Bot' /></a> " +
						" </div> "+
					" </div>";
}

//This function will generate the html for message sent by user
function getUserResponseAsHTML(msg){
	return "<div class='custom-msg-wrapper'> "+
				"<div class='col-xs-2 p-r-0 p-l-2'> " +
					" <img   src='"+USER_ICON+"' class='img-responsive pull-left' alt='User' />"+ 
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

function sendGiftCard(){
/*	var msg =
getBotResponseAsHTML(	'<p>Hey<b> Arnav Simer</b>we have some great offers for you</p><table class="centered" style="border:1px;"><tbody><tr><td><b>70% off on shoes</b></td><td> <span class="new badge">dfsjkfhw929iw33hfwe</span></td></tr><tr><td><b>80% off on Elcectronics</b></td><td>dfsjkfhw929iw33hfwe</td></tr><tr><td><b>90% off on clothes</b></td><td> dfsjkfhw929iw33hfwe</td></tr></tbody></table>');
*/
	var msg =
getBotResponseAsHTML(	
'<div class="card">    <div class="card-image waves-effect waves-block waves-light">      <img class="activator" src="/images/Early-Bird.png">    </div>    <div class="card-content">      <span class="card-title activator grey-text text-darken-4">Offer for you<i class="material-icons right">more_vert</i></span>      <p><a class="waves-effect waves-light btn">Coupon : ABC4DGML5</a></p>    </div>    <div class="card-reveal">      <span class="card-title grey-text text-darken-4">Offer for you.<i class="material-icons right">close</i></span>      <p><h3>T&C of cupon</h3><br> 1.This coupon is valid only for two days from now.<br>2.This coupon can be used twice</p>    </div>  </div>');

	conversation.push(msg);
	setResponse();
	
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude;
}

function chkusr(){
	$.ajax({
			type: "GET",
			url: '/chkusr',
			beforeSend: function() {  
				$('#loader').css('display','inline-block');
			}, 
			success: function(data) {
				if(data === '1'){
					conversation.push(getBotResponseAsHTML((DEFAULT_WELCOME_MSG)));
					speak(DEFAULT_WELCOME_MSG);
					setResponse();
					$('#loader').hide();
				}else{
					$('.custom-msg-writer').hide();
					runRegistraionFlow();
				}
			},
			error: function() {
				setResponse("Internal Server Error");
			}
		});
}
chkusr();
function runRegistraionFlow(){
	conversation.push(getBotResponseAsHTML("<p>You seems  to be visting first time.</p><p>Please spare minute to provide your personal details</p>"));
	setResponse();
	setTimeout(function(){
		conversation.push(getBotResponseAsHTML('  <div id="name-div" class="row">           <div class="input-field col s9">               <input id="name" type="text" class="validate" onkeydown = "checkName()">               <label for="name"  data-error="wrong" data-success="right">Name</label>           </div>           <div class="input-field col s3">               <button class="btn waves-effect waves-light disabled" id="name-btn" type="button" name="action" onClick = validate()>Go!</button>           </div>       </div>'));
	setResponse();},1000);
	$('#loader').hide();
}
var registrationData = {'name':'','gender':'','mobile':''};
function registerUser(){
	$.ajax({
		type: "POST",
		url: "/register",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify(registrationData),
		beforeSend: function() {  
				$('#loader').css('display','inline-block');
		},
		success: function(result) {
			conversation.push(getBotResponseAsHTML('<p>Thanks alot for giving your time</p>'));
			setResponse();
			
			setTimeout(function(){
			conversation = [];
			conversation.push(getBotResponseAsHTML((DEFAULT_WELCOME_MSG)));
			setResponse();
			$('.custom-msg-writer').show();},1000);
			$('#loader').hide();
		}
	});
}
function validate(){
	if($("#name").val()){
		if($("#name").val().length > 0){
			var curVal = $("#name").val();
			conversation.pop();
			conversation.push(getBotResponseAsHTML('<span> Name : '+curVal+'</span>'));			
			conversation.push(getBotResponseAsHTML('<div class="row"><div class="input-field col s9 ">    <select id = "gender"><option value="-1" disabled selected></option>       <option value="1">Male</option>      <option value="2">Female</option></select>    <label>Gender</label> </div> <div class="input-field col s3">  <button class="btn waves-effect waves-light" id="gender-btn" type="button" name="action" onClick = validate()>Go!</button>           </div></div>'));
			setResponse();
			
			$('select').formSelect();
			$('#response').scrollTop($('#response')[0].scrollHeight);
			registrationData.name = curVal;
			return;
		}
		else{
			 alert(" Please enter a valid name");
			 return;
		}
	}
	if($("#gender").val()){
		if($('#gender option:selected').val() !== "-1"){
			var curVal = $('#gender option:selected').text();
			conversation.pop();
			conversation.push(getBotResponseAsHTML('<span> Gender : '+curVal+'</span>'));			
			conversation.push(getBotResponseAsHTML('  <div  class="row">           <div class="input-field col s9">               <input id="mobile" type="text" class="validate" onkeydown = "checkMobile()">               <label for="mobile" >Mobile</label>           </div>           <div class="input-field col s3">               <button class="btn waves-effect waves-light disabled" id="mobile-btn" type="button" name="action" onClick = validate()>Go!</button>           </div>       </div>'));
			setResponse();
			$('#response').scrollTop($('#response')[0].scrollHeight);
			registrationData.gender = curVal;
		}
		else{
			 alert(" Please select the geneder") 
		}
	}
	if($("#mobile").val()){
		if($('#mobile').val().length > 0 ){
			var curVal = $('#mobile').val();
			conversation.pop();
			conversation.push(getBotResponseAsHTML('<span> Mobile : '+curVal+'</span>'));
			setResponse();
			$('#response').scrollTop($('#response')[0].scrollHeight);
			registrationData.mobile = curVal;
			registerUser();
		}
		else{
			 alert(" Please enter a valid mobile");
		}
	}
}
function checkName() {
	setTimeout(function(){
	if($("#name").val().length == 0){
		$('#name-btn').addClass('disabled');
	}else{
		$('#name-btn').removeClass('disabled');
	}},100);
};
function checkMobile() {
	setTimeout(function(){
	
	var IndNum = /^[0]?[789]\d{9}$/;
	if(IndNum.test($('#mobile').val())){
		$('#mobile-btn').removeClass('disabled');
	}else{
		$('#mobile-btn').addClass('disabled');
	}},100);
};
var recognition;
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
	$("#input_h").val(text);
	sendMessage(text);
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
var chatId = "";
function logChat(sender,msg){
$.ajax({
		type: "POST",
		url: "/log",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify({'sender':sender,'msg':msg,'chatId':chatId}),
		success: function(result) {
			console.log("chat with chatId = "+ result +" saved");

				chatId = result;
			
		}
	});
}