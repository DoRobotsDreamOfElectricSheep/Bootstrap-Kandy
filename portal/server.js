var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var validUsers = {
        users: [
            {
                'username': 'user1',
                'password': '1quovelitest1',
                'hash': '9df0fs00340dfasf',
                'admin': false
            },
            {
                'username': 'user2',
                'password': '2cumoccaecatiaccu2',
                'hash': '213lkoia0sd90223',
                'admin': true
            }
        ]
};

var domain = '@kandy-bootstrap.gmail.com';
var javascriptTagBase = '"<script src="//localhost:3030/script/bootstrap_kandy_{{hash}}"</script>"';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/portal', function (req, res) {
    if(!req.body) {
        res.send('failure');
        return;
    }

    var username = req.body.login;
    var password = req.body.password;

    var val = isValidUser(username, password);
    if(!val[0]) {
        res.end();
        return;
    }

    var userHash = val[1];
    var jsTag = javascriptTagBase.replace('{{hash}}', userHash);

    res.end(jsTag);
});

function isValidUser(username, password) {
    for(var i in validUsers.users) {
        user = validUsers.users[i];
        if(user.username === username) {
            if(user.password === password) {
                return [true, user.hash];
            }
        }
    }

    return [false, ''];
}

var server = app.listen(3030, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Portal server running at http://%s:%s', host, port);
});