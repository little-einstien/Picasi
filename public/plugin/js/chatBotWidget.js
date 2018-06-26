// var APP_URL = "https://demochatbot.herokuapp.com";
var APP_URL = "http://localhost:3000";
function initbot() {
    var pid = $('#bot-script').attr('data-project');
	$('head').append('<link rel="stylesheet" type="text/css" href="'+APP_URL+'/plugin/css/widget.css">');
	$('head').append('<link rel="stylesheet" type="text/css" href="https://daneden.github.io/animate.css/animate.min.css">');
	$("body").append('<div id="main-div-wrapper" class="animated"></div>');

	var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", "http://localhost:4201/project/"+pid);
    ifrm.setAttribute("allow" , "geolocation");
    ifrm.style.width = "100%";
	ifrm.style.height = "100%";
    ifrm.style.border = "0px";
    ifrm.style.transition = "all .3s ease";
    document.getElementById('main-div-wrapper').appendChild(ifrm);
    
    var createDiv =  document.createElement("div");
    createDiv.className = 'chatbot-icon chat-icon animated fadeIn '
    createDiv.id = 'chatboticon'
    //createDiv.innerHTML = '<img src="'+APP_URL+'/plugin/images/chatbot.png" alt="ChatBot" />';
    document.body.appendChild(createDiv);
// 	setTimeout(function(){	$('#main-div-wrapper').toggleClass('widget-toggle');
//     $('#chatboticon').hide();
//  }, 2000);
}
initbot();

$('.chatbot-icon').click(function(){
	$('#main-div-wrapper').toggleClass('widget-toggle');
    //$(this).hide();
    if($(this).hasClass('chat-icon')){
        $(this).removeClass('chat-icon');
        $(this).addClass('chat-close');
        $('#main-div-wrapper').addClass('fadeIn');
        $('#main-div-wrapper').removeClass('fadeOut');
    }else if($(this).hasClass('chat-close')){
        $(this).removeClass('chat-close');
        $(this).addClass('chat-icon');
        $('#main-div-wrapper').addClass('fadeOut');
        $('#main-div-wrapper').removeClass('fadeIn');
    }
});
function close(){
	$('#main-div-wrapper').removeClass('widget-toggle');
	$('.chatbot-icon').show();
};
function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
window.addEventListener('close',function(){
    alert();
});
window.addEventListener('message', function(e) {
    close()
  });