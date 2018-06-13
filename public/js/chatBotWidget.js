function initbot() {
	$('head').append('<link rel="stylesheet" type="text/css" href="http://35.200.142.0:3000/plugin/css/widget.css">');
	$("body").append('<div id="main-div-wrapper"><div id="close-icon"><i class="far fa-times-circle"></i></div></div>');

	var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", "http://35.200.142.0:4201/project/MNP52wF");
    ifrm.style.width = "100%";
	ifrm.style.height = "100%";
    ifrm.style.border = "0px";
    ifrm.style.transition = "all .3s ease";
    document.getElementById('main-div-wrapper').appendChild(ifrm);
    var createDiv =  document.createElement("div");
    createDiv.className = 'chatbot-icon'
    createDiv.id = 'chatboticon'
    createDiv.innerHTML = '<img src="http://localhost:3000/plugin/images/chatbot.svg" alt="ChatBot" />';
    document.body.appendChild(createDiv);
	setTimeout(function(){	$('#main-div-wrapper').toggleClass('widget-toggle');
    $('#chatboticon').hide();
 }, 2000);
}
initbot();
$('.chatbot-icon').click(function(){
	$('#main-div-wrapper').toggleClass('widget-toggle');
    $(this).hide();
});
$('#close-icon i').click(function(){
	$('#main-div-wrapper').removeClass('widget-toggle');
	$('.chatbot-icon').show();
});

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
