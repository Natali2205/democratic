(function(){
	var ENDPOINT = "/notifications-websocket";
	var WS_CHANAL = "/queue/support-notification/new";
	var protocols = [ "websocket", "xhr-streaming", "iframe-xhr-polling","xhr-polling", "jsonp-polling" ];
	var socket;
	var stompClient;
	$(document).ready(function(){
		connect();
	});
	function connect() {
		socket = new SockJS(ENDPOINT, null,{
			transports : protocols
		});
		stompClient = Stomp.over(socket);
		stompClient.debug =  null;//function(e){console.log(e)};
		if (stompClient.connected == false) {
			stompClient.connect({}, function(frame) {
				addSubscribers();
			});
		}
	}
	
	function addSubscribers() {
		stompClient.subscribe(WS_CHANAL, function(message) {
			showSupportNotification(message.body);
		});
	}
	
	function showSupportNotification(message){
		increaseCounter($(".countHolder div, .countHolder2 div"));
	}
	
	function increaseCounter($counter){
		var num = parseInt($counter.get(0).innerText);
		if(!isNaN(num) && isFinite(num)){
			num ++;
		}else{
			num = 1;
		}
		$counter.each(function(i,el){
			$(el).addClass("counter").text(num);
		});
	}
}())