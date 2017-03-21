var app = require('express')();
var server = app.listen(80);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var LockFrameServer = {
    _clientId: 0,
    _clientSocketList: [],
    _clientCount: 2,
    _currentReadyCount: 0,
    _clientReadyRecord: {},

    _generateClientId: function() {
        return this._clientId++;
    },

    AddClient: function(clientSocket) {
        clientSocket.socketId = this._generateClientId();
        this._clientSocketList.push(clientSocket);
    },

    RemoveClient: function(clientSocket) {
        var index = this._clientSocketList.indexOf(clientSocket);
        if (index != -1) {
            this._clientSocketList.splice(index, 1);
            delete this._clientReadyRecord[clientSocket.socketId];
            if (this._currentReadyCount > 0) {
                this._currentReadyCount--;
            }
        }
    },

    OnClientReady: function(clientSocket) {
        if (this._clientReadyRecord[clientSocket.socketId]) {
            console.log("[error] client already ready..." + clientSocket.socketId);            
            return;
        }
        this._clientReadyRecord[clientSocket.socketId] = true;
        this._currentReadyCount++;
        if (this._currentReadyCount >= this._clientCount) {
            console.log("all ready!!");
            this._clientSocketList.forEach(function(socket) {
                socket.emit("start", { fps: 30, keyFrame: 5 });
            }, this);
        }
    }
};

io.on('connection', function(socket) {
    LockFrameServer.AddClient(socket);
    socket.emit('connected',  {});
    socket.on('ready', function(data) {
        LockFrameServer.OnClientReady(socket);
    });
    socket.on('disconnect', function(data) {
        console.log('client disconnected: ' + data);
        LockFrameServer.RemoveClient(socket);
    });
});