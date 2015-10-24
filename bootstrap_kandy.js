var bsk_setup = function(apiKey, username, password) {
    bsk = new bootstrap_kandy(apiKey, username, password);
};

var bootstrap_kandy = function(apiKey, username, password) {
    var callId = null;
    var userId = null;

    var registerContainers = function() {
        $('#call').on('click', function(){
            // for the purpose of this, this will be hardcoded
            kandy.call.makeCall('user2@kandy-bootstrap.gmail.com', true);
        });

        $('#answerCall').on('click', function(){
            kandy.call.answerCall(callId, true);
        });

        $('#endCall').on('click', function(){
            kandy.call.endCall(callId);
        });
    };

    var onLoginSuccess = function() {
        alert('login success');
    };

    var onLoginFailure = function() {
        console.log('login failed');
    };

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
        remoteVideoContainer: document.getElementById('remote-video'),
        localVideoContainer: document.getElementById('local-video'),

        listeners: {
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