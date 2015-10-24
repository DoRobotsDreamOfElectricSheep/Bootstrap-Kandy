var bsk_setup = function(apiKey, username, password) {
    bsk = new bootstrap_kandy(apiKey, username, password);
};

var bootstrap_kandy = function(apiKey, username, password) {
    var callId = null;
    var userId = null;
    var recipient = 'user2@kandy-bootstrap.gmail.com';

    var registerContainers = function() {
        $('#call').on('click', function(){
            // for the purpose of this, this will be hardcoded
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

        var element = "<div>Incoming (recieved): " + unescape(message.message.text) + "</div>";
        document.getElementById("chat-messages").innerHTML += element;
    };

    var onSendSuccess = function(message) {
        console.log('messge send success');

        var element = "<div>Outgoing (sent): " + unescape(message.message.text) + "</div>";
        document.getElementById("chat-messages").innerHTML += element;
    };

    var onSendFailure = function() {
        console.log('message failed to send');
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