var app = require('express')();
var server = app.listen(80);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.emit('res', { hello : 'world' });
    socket.on('req', function(data) {
        console.log(data);
    });
});