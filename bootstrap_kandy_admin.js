$(function(){
    bsk_setup('DAKaa831cc0aa8548dd9de3e36404dd0168', 'user2@kandy-bootstrap.gmail.com', '2cumoccaecatiaccu2');
});

var bsk_setup = function(apiKey, username, password) {
    var loadedCheck = setInterval(function(){
        var htmlString = "<style>#bootstrap-kandy{position: fixed; left: 600px; top: 150px; width: 140px;}#bootstrap-kandy.bk-open{width: 280px;}#bootstrap-kandy > div{border:white 8px solid; border-radius: 8px;}#bk-icon{color: white; height: 54px;}#bk-control{color:white; height: 113px; overflow: auto; padding: 10px; display:none;}#bk-control.bk-open{height:56.5px; overflow: hidden; padding:0; background-color: rgba(24, 50, 75, 0.55);}#message-icon, #share-icon{background-image: url(http://bootykandy.s3-us-west-2.amazonaws.com/message-icon.png); background-repeat: no-repeat; background-size: contain;}#title{left: 15px; position: relative; top: 15px; font-size: 20px;}#message-icon{height: 71%; width: 100%; margin: 3px 0 0 5px;}#message-screen{height: 200px;}#call-icon{background-image: url(http://bootykandy.s3-us-west-2.amazonaws.com/call-icon.png); background-repeat: no-repeat; background-size: contain; width: 68%; height: 100%; margin: 3px 0 0 10px;}#call-screen{height: 100px;}#video-icon{background-image: url(http://bootykandy.s3-us-west-2.amazonaws.com/video-icon.png); background-repeat: no-repeat; background-size: contain; width: 81%; height: 100%; margin: 4px 0 0 5px;}#share-icon{background-image: url(http://bootykandy.s3-us-west-2.amazonaws.com/video-icon.png); background-repeat: no-repeat; background-size: contain; width: 81%; height: 100%; margin: 4px 0 0 5px;}.icon-container{float:left; width:50%; height:50%; position: relative; text-align: center;}.icon-container.bk-open{width:25%; height:100%;}.icon-title{position: absolute; bottom: 0; text-align: center; width: 100%;}.received-message{background: #A9FFA9; border: #A9FFA9 1px solid;}.screen{background-color: rgba(24, 50, 75, 0.55); border: white 8px solid; border-radius: 5px; display:none;}.buttonHighlight{border-color: lightblue; background-color: lightblue;}.buttonNoHighlight{border-color: none; background-color: none;}#share-screen.cobrowsing{position: fixed; top: 0; left: 0;}.sent-message, .received-message{position: relative; text-align: center; border: 2px solid #FFF; border-radius: 30px; box-shadow: 0px 0px 5px #FFF; background-color: rgba(24, 50, 75, 0.55); color: white; margin-bottom: 22px; display: inline-block; padding: 0 25px 0 10px; min-width: 94px;}.sent-message:before{content: ' '; position: absolute; width: 0; height: 0; left: 22px; top: 20px; border: 7px solid; border-color: #FFF transparent transparent #FFF;}</style><div id='bootstrap-kandy'> <div id='bk-icon'> <div id='title'>Live Chat</div></div><div id='bk-control'> <div class='icon-container'> <div id='message-icon'></div><div class='icon-title'>message</div></div><div class='icon-container'> <div id='call-icon'></div><div class='icon-title'>call</div></div><div class='icon-container'> <div id='video-icon'></div><div class='icon-title'>video</div></div><div class='icon-container'> <div id='share-icon'></div><div class='icon-title'>share</div></div></div><div id='video-screen' class='screen'> <button id='callVideo'>Call</button> <button id='answerCallVideo'>Answer</button> <button id='endCallVideo'>End Call</button> <div id='remote-video'></div><div id='local-video'></div></div><div id='call-screen' class='screen'> <button id='call'>Call</button> <button id='answerCall'>Answer</button> <button id='endCall'>End Call</button> </div><div id='message-screen' class='screen'> <div id='chat-messages'></div><input id='messageBox'> <button id='sendMessage'>Send</button> </div><div id='share-screen' class='screen'> <button id='createSession'>Create</button> <button id='startUser'>Start User</button> <button id='stopUser'>Stop User</button> <button id='startAgent'>Start Agent</button> <button id='stopAgent'>Stop Agent</button> <div id='cobrowsing-container'></div></div></div><script></script>";
        $("body").append(htmlString);
        bsk = new bootstrap_kandy(apiKey, username, password);
        clearInterval(loadedCheck);
    },1000);

};

var bootstrap_kandy = function(apiKey, username, password) {
    var callId = null;
    var userId = null;
    var sessionId = null;
    var secretSessionIdBase = 'sid^';

    // audio for calls
    var $audioRingIn = $('<audio>', { loop: 'loop', id: 'ring-in' });
    var $audioRingOut = $('<audio>', { loop: 'loop', id: 'ring-out' });

    // Load audio source to DOM to indicate call events
    var audioSource = {
        ringIn: [
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.mp3', type: 'audio/mp3' },
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringin.ogg', type: 'audio/ogg' }
        ],
        ringOut: [
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.mp3', type: 'audio/mp3' },
            { src: 'https://kandy-portal.s3.amazonaws.com/public/sounds/ringout.ogg', type: 'audio/ogg' }]
    };

    audioSource.ringIn.forEach(function(entry) {
        var $source = $('<source>').attr('src', entry.src);
        $audioRingIn.append($source);
    });

    audioSource.ringOut.forEach(function(entry) {
        var $source = $('<source>').attr('src', entry.src);
        $audioRingOut.append($source);
    });

    var recipient = null;
    // TODO: not hardcode
    var serviceRepresentative = 'user2@kandy-bootstrap.gmail.com';

    var registerContainers = function() {
        var $bk = $("#bootstrap-kandy");
        var $bkIcon = $("#bk-icon");
        var $icons = $(".icon-container");
        var $bkControl = $("#bk-control");
        var $messageScreen = $("#message-screen");
        var $callScreen = $("#call-screen");
        var $videoScreen = $("#video-screen");
        var $shareScreen = $("#share-screen");
        var hideTitle = false;
        var showControl = false;

        $audioRingIn[0].pause();
        $audioRingOut[0].pause();

        $('#callVideo').on('click', function(){
            kandy.call.makeCall(serviceRepresentative, true);
        });

        $('#answerCallVideo').on('click', function(){
            $audioRingIn[0].pause();
            $audioRingOut[0].pause();
            kandy.call.answerCall(callId, true);
        });

        $('#call').on('click', function(){
            kandy.call.makeCall(serviceRepresentative, false);
        });

        $('#answerCall').on('click', function(){
            $audioRingIn[0].pause();
            $audioRingOut[0].pause();
            kandy.call.answerCall(callId, false);
        });

        $('#endCall').on('click', function(){
            $audioRingOut[0].pause();
            $audioRingIn[0].pause();
            kandy.call.endCall(callId);
        });

        $('#endCallVideo').on('click', function(){
            $audioRingOut[0].pause();
            $audioRingIn[0].pause();
            kandy.call.endCall(callId);
        });

        $('#sendMessage').on('click', function(){
            var message = document.getElementById('messageBox').value;

            if(recipient === null) {
                recipient = serviceRepresentative;
            }
            kandy.messaging.sendIm(recipient, message, onSendSuccess, onSendFailure);
        });

        $('#createSession').on('click', function() {
            document.getElementById('createSession').disabled = true;
            createSession();
        });

        $('#startUser').on('click', function() {
            document.getElementById('startUser').disabled = true;
            kandy.coBrowsing.startBrowsingUser(sessionId);
            document.getElementById('stopUser').disabled = false;
        });

        $('#stopUser').on('click', function() {
            document.getElementById('stopUser').disabled = true;
            kandy.coBrowsing.stopBrowsingUser();
            document.getElementById('createSession').disabled = false;
        });

        $('#startAgent').on('click', function() {
            $('#startAgent').removeClass('buttonHighlight');
            $('#startAgent').addClass('buttonNoHighlight');
            document.getElementById('startAgent').disabled = true;

            var container = document.getElementById('cobrowsing-container');

            kandy.coBrowsing.startBrowsingAgent(sessionId, container);

            document.getElementById('stopAgent').disabled = false;
        });

        $('#stopAgent').on('click', function() {
            var shareScreen = document.getElementById('share-screen');
            $(shareScreen).removeClass("cobrowsing");

            document.getElementById('stopAgent').disabled = true;
            kandy.coBrowsing.stopBrowsingAgent();
        });

        var waitForSession = setInterval(function(){
            var container = document.getElementById('cobrowsing-container');
            if($(container).height() > 1) {
                var shareScreen = document.getElementById('share-screen');
                $(shareScreen).addClass("cobrowsing");
                clearInterval(waitForSession);
            }
        },1000);

        $bkIcon.hover(function() {
            $bkIcon.hide();
            $bkControl.show();
        });

        $bkControl.mouseleave(function(){
            if(!hideTitle)
                $bkIcon.show();
        });

        $("#bootstrap-kandy").on("click","#message-icon", function(){
            if(!showControl){
                showControl = true;
                $bk.addClass("bk-open");
                $bkControl.addClass("bk-open");
                $icons.addClass("bk-open");
            }

            hideTitle = true;

            $messageScreen.toggle();
        });

        $("#call-icon").click(function(){

            hideTitle = true;
            $callScreen.toggle();
        });

        $("#video-icon").click(function(){
            hideTitle = true;
            $videoScreen.toggle();
        });

        $("#share-icon").click(function(){
            hideTitle = true;
            $shareScreen.toggle();
        });

        document.getElementById('startUser').disabled = true;
        document.getElementById('stopUser').disabled = true;
        document.getElementById('startAgent').disabled = true;
        document.getElementById('stopAgent').disabled = true;

        if(userId === serviceRepresentative) {
            $('#startUser').hide();
            $('#stopUser').hide();
            $('#createSession').hide();
        } else {
            $('#stopAgent').hide();
            $('#startAgent').hide();
        }
    };

    /************** Login callbacks **************/
    var onLoginSuccess = function() {
        console.log('login success');
    };

    var onLoginFailure = function() {
        alert('login failed');
    };


    /************** Message chat callbacks **************/
    var onMessageReceived = function(message) {

        if(message.message.text.startsWith(secretSessionIdBase)) {
            setSessionId(message.message.text);
            return;
        }

        recipient = message.sender.full_user_id;
        var element = "<div class='received-message'>" + unescape(message.message.text) + "</div>";
        document.getElementById("chat-messages").innerHTML += element;
    };

    var onSendSuccess = function(message) {
        if(message.message.text.startsWith(secretSessionIdBase)) {
            return;
        }

        var element = "<div class='sent-message'>" + unescape(message.message.text) + "</div>";
        document.getElementById("chat-messages").innerHTML += element;
    };

    var onSendFailure = function() {
        console.log('message failed to send');
    };

    var setSessionId = function(message) {
        var parts = message.split('^');
        if(parts.length < 2) {
            return;
        }

        sessionId = parts[1];
        kandy.session.join(sessionId, {}, onSessionJoinSuccess, onSessionFailure);

        document.getElementById('startAgent').disabled = false;
        $('#startAgent').removeClass('buttonNoHighlight');
        $('#startAgent').addClass('buttonHighlight');
    };

    /************** Video chat callbacks **************/
    var onCallInitiated = function(call, callee) {
        $audioRingIn[0].play();
        $audioRingOut[0].pause();

        callId = call.getId();
    };

    var onCallIncoming =function(call) {
        alert('call incoming');
        callId = call.getId();
    };

    var onCallAnswered = function(call) {
    };

    var onCallEnded = function(call) {
    };

    var onCallEstablished = function(call) {
        $audioRingIn[0].pause();
        $audioRingOut[0].pause();
    };


    /************** Co Browsing Functions **************/
    var createSession = function () {
        var randomId = Date.now();
        var sessionConfig = {
            session_type: randomId,
            session_name: randomId,
            session_description: randomId
        };

        kandy.session.create(sessionConfig, onSessionCreateSuccess, onSessionFailure);

        document.getElementById('startUser').disabled = false;
        document.getElementById('startAgent').disabled = false;
        document.getElementById('stopAgent').disabled = false;
    };

    /************** Co Browsing Callbacks **************/
    var onSessionUserJoinRequest = function(data) {
        kandy.session.acceptJoinRequest(data.session_id, data.full_user_id);
    };

    var onSessionCreateSuccess = function(session) {
        sessionId = session.session_id;

        kandy.session.activate(sessionId);
        kandy.session.setListeners(sessionId, {
            onUserJoinRequest: onSessionUserJoinRequest
        });

        // send session id to agent
        secretSessionId = secretSessionIdBase + sessionId;
        if(recipient === null) {
            recipient = serviceRepresentative;
        }

        kandy.messaging.sendIm(recipient, secretSessionId, onSendSuccess, onSendFailure);
    };

    var onSessionFailure = function(session) {
        console.log('error joining/creating session');
    };

    var onSessionJoinSuccess = function() {

        kandy.session.setListeners(sessionId, {
            // TODO: do something with this
            onJoinApprove: ''
        });
    };

    kandy.setup({
        // for video calling
        remoteVideoContainer: document.getElementById('remote-video'),
        localVideoContainer: document.getElementById('local-video'),

        listeners: {
            // for message
            message: onMessageReceived,

            // for video calls
            callinitiated: onCallInitiated,
            callincoming: onCallIncoming,
            callestablished: onCallEstablished,
            callended: onCallEnded
        },
        autoreconnect: true,
        registerforcalls: true,
        loglevel: 'debug'
    });
    userId = username;
    kandy.login(apiKey, username, password, onLoginSuccess, onLoginFailure);

    registerContainers();
};