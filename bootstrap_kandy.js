var bsk_setup = function(apiKey, username, password) {
    bsk = new bootstrap_kandy(apiKey, username, password);
};

var bootstrap_kandy = function(apiKey, username, password) {
    var callId = null;
    var userId = null;
    var sessionId = null;
    var secretSessionIdBase = 'sid^';

    var recipient = null;
    // TODO: not hardcode
    var serviceRepresentative = 'user2@kandy-bootstrap.gmail.com';

    var registerContainers = function() {
        $('#callVideo').on('click', function(){
            kandy.call.makeCall(serviceRepresentative, true);
        });

        $('#answerCallVideo').on('click', function(){
            kandy.call.answerCall(callId, true);
        });

        $('#call').on('click', function(){
            kandy.call.makeCall(serviceRepresentative, false);
        });

        $('#answerCall').on('click', function(){
            kandy.call.answerCall(callId, false);
        });

        $('#endCall').on('click', function(){
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
            document.getElementById('stopAgent').disabled = true;
            kandy.coBrowsing.stopBrowsingAgent();
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
        alert('login success');
    };

    var onLoginFailure = function() {
        console.log('login failed');
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
        callId = call.getId();
    };

    var onCallIncoming =function(call) {
        alert('call incoming');
        callId = call.getId();
    };

    var onCallAnswered = function(call) {
    };

    var onCallEnded = function(call) {
        callId = null;
    };

    var onCallEstablished = function(call) {
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