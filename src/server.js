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
                    const headers = {
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
                        "Access-Control-Allow-Credentials": true,
                        "Content-Type": "text/html"
                    };
                            res.writeHead(200, headers);
                    res.end(content);
                });
        });
        this.io = serverIo(this.server, { origins: '*:*' });
        this.sockMap= {};
    }

    listen() {
        this.io.on('connection', (socket) => {
            this.sockMap[socket.id] = socket;

            // Session events are used to join a connection.
            // The session key is mapped in a map to socket.id
            socket.on('session', (key) => {
                console.log(key);
                socket.join(`${key}`);
                this.sockMap[socket.id] = key;
            });

            socket.on('update', (msg) => {
                console.log(msg);
                var key = this.sockMap[socket.id];
                socket.broadcast.to(`${key}`).emit('update', msg);
            });

            socket.on('open', (msg) => {
                console.log(msg);
                var key = this.sockMap[socket.id];
                socket.broadcast.to(`${key}`).emit('open', msg);
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
