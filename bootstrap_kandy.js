var bsk_setup = function(apiKey, username, password) {
    bsk = new bootstrap_kandy(apiKey, username, password);
};

var bootstrap_kandy = function(apiKey, username, password) {
    var callId = null;
    var userId = null;
    var sessionId = null;
    var secretSessionIdBase = 'sid^';

    // TODO: not hardcode
    var recipient = 'user2@kandy-bootstrap.gmail.com';

    var registerContainers = function() {
        $('#call').on('click', function(){
            kandy.call.makeCall(recipient, true);
        });

        $('#answerCall').on('click', function(){
            kandy.call.answerCall(callId, true);
        });

        $('#endCall').on('click', function(){
            kandy.call.endCall(callId);
        });

        $('#sendMessage').on('click', function(){
            var message = document.getElementById('messageBox').value;
            kandy.messaging.sendIm(recipient, message, onSendSuccess, onSendFailure);
        });

        $('#createSession').on('click', function() {
            console.log('creating session');
            createSession();
        });

        $('#joinSession').on('click', function() {
            console.log('joining session');
            sessionId = document.getElementById("session-id").value;
            kandy.session.join(sessionId, {}, onSessionJoinSuccess, onSessionFailure);
        });

        $('#startUser').on('click', function() {
            console.log('start user');
            kandy.coBrowsing.startBrowsingUser(sessionId);
        });

        $('#stopUser').on('click', function() {
            console.log('stop user');
            kandy.coBrowsing.stopBrowsingUser();
        });

        $('#startAgent').on('click', function() {
            console.log('start agent');
            var container = document.getElementById('cobrowsing-container');
            kandy.coBrowsing.startBrowsingAgent(sessionId, container);
        });

        $('#stopAgent').on('click', function() {
            console.log('stop agent');
            kandy.coBrowsing.stopBrowsingAgent();
        });
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
        console.log('message received');

        if(message.message.text.startsWith(secretSessionIdBase)) {
            setSessionId(message.message.text);
            return;
        }

        var element = "<div>Incoming (recieved): " + unescape(message.message.text) + "</div>";
        document.getElementById("chat-messages").innerHTML += element;
    };

    var onSendSuccess = function(message) {
        console.log('messge send success');
        if(message.message.text.startsWith(secretSessionIdBase)) {
            return;
        }
        
        var element = "<div>Outgoing (sent): " + unescape(message.message.text) + "</div>";
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
        alert('Casting ready. Click Start agent to join');
    };

    /************** Video chat callbacks **************/
    var onCallInitiated = function(call, callee) {
        console.log('call initiated');

        callId = call.getId();
    };

    var onCallIncoming =function(call) {
        alert('call incoming');
        callId = call.getId();
    };

    var onCallAnswered = function(call) {
        console.log('call answered');
    };

    var onCallEnded = function(call) {
        console.log('call ended');
        callId = null;
    };

    var onCallEstablished = function(call) {
        console.log('call established');
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
    };

    var joinSession = function() {
        sessionId = document.getElementById('session-id').value;
        kandy.session.join(sessionId, {}, onSessionJoinSuccess, onSessionFailure);
    };

    /************** Co Browsing Callbacks **************/
    var onSessionUserJoinRequest = function(data) {
        kandy.session.acceptJoinRequest(data.session_id, data.full_user_id);
    };

    var onSessionCreateSuccess = function(session) {
        sessionId = session.session_id;
        document.getElementById('session-id').value = sessionId;

        kandy.session.activate(sessionId);
        kandy.session.setListeners(sessionId, {
            onUserJoinRequest: onSessionUserJoinRequest
        });

        // send session id to agent
        secretSessionId = secretSessionIdBase + sessionId;
        kandy.messaging.sendIm(recipient, secretSessionId, onSendSuccess, onSendFailure);
    };

    var onSessionFailure = function(session) {
        console.log('error joining/creating session');
    };

    var onSessionJoinSuccess = function() {
        document.getElementById('session-id').value = sessionId;

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