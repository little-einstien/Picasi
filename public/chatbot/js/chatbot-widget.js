function initbot() {
	var jsUrl = document.getElementById("chatbot-script").src.toString();
	var APP_URL = document.getElementById("chatbot-script").src.toString().substring(0, document.getElementById("chatbot-script").src.toString().length-20);
	$('head').append('<link rel="stylesheet" type="text/css" href="'+APP_URL+'css/widget.css">');
	$("body").append('<div id="main-div-wrapper"><div id="close-icon"><i class="far fa-times-circle"></i></div></div>');
	var ifrm = document.createElement("iframe");
	ifrm.setAttribute("src", ""+APP_URL+"chatbot.html");
	ifrm.style.width = "100%";
	ifrm.id = "chatbot-frame";
	ifrm.style.height = "100%";
	ifrm.style.border = "0px";
	ifrm.style.transition = "all .3s ease";
	document.getElementById('main-div-wrapper').appendChild(ifrm);
	var createDiv =  document.createElement("div");
	createDiv.className = 'chatbot-icon'
	createDiv.id = 'chatboticon'
	createDiv.innerHTML = '<img src="'+APP_URL+'images/chatbot.svg" alt="ChatBot"/>';
	document.body.appendChild(createDiv);
}
//initbot();

function hear(message){
	if(!$('#main-div-wrapper').hasClass('widget-toggle')){
		$('#main-div-wrapper').toggleClass('widget-toggle');	
	}
	if($('.chatbot-icon').is(":visible")){
		$('.chatbot-icon').hide();
	}
	setTimeout(function(){
		document.getElementById('chatbot-frame').contentWindow.postMessage({'message':message,'method':'hear'},"*");
	},1000);
}
$(document).ready(function(){
	initbot();
	$('.chatbot-icon').click(function(){
		$('#main-div-wrapper').toggleClass('widget-toggle');
			$('.chatbot-icon').hide();
	});
	$('#close-icon i').click(function(){
		$('#main-div-wrapper').removeClass('widget-toggle');
		$('.chatbot-icon').show();
	});
});