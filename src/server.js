var http = require('http');
var fs = require('fs');
var serverIo = require('socket.io');
var config = require('../config/config');

class Server {
    constructor() {
        this.server = http.createServer(
            function(req, res) {
            fs.readFile('./pageindex.html', 
                'utf-8', function(error, content) {
                    res.writeHead(200, 
                        {"Content-Type": "text/html"});
                    res.end(content);
                });
        });
        this.io = serverIo(this.server);
        this.io.origins('*:*');
        this.sockMap= {};
    }

    listen() {
        this.io.on('connection', (socket) => {
            this.sockMap[socket.id] = socket;

            // Session events are used to join a connection.
            // The session key is mapped in a map to socket.id
            socket.on('session', (key) => {
                socket.join(`${key}`);
                this.sockMap[socket.id] = key;
            });

            socket.on('update', (msg) => {
                var key = this.sockMap[socket.id];
                socket.broadcast.to(`${key}`).emit('update', msg);
            });

            socket.on('disconnect', () => {
                socket.leave(`${this.sockMap[socket.id]}`);
                delete this.sockMap[socket.id];
            });
        });

        this.server.listen(config.app.port, function(){
            console.log(`listening on ${config.app.host}:${config.app.port}`);
        });
    }

    close() {
        this.server.close();
        console.log("closing server...");
    }
}

module.exports = Server;
