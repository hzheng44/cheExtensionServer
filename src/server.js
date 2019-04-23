var http = require('http');
var express = require('express')
var cors = require('cors')
var app = express()

var fs = require('fs');
var serverIo = require('socket.io');
var config = require('../config/config');


app.use(cors());
var server = require('http').Server(app);

class Server {
    constructor() {
        this.server = server;
        // this.server = http.createServer(
        //     function(req, res) {
        //     fs.readFile('./pageindex.html', 
        //         'utf-8', function(error, content) {
        //             res.setHeader("Content-Type", "text/html")
        //             res.setHeader("Access-Control-Allow-Credentials", true)
        //             res.setHeader("Access-Control-Allow-Origin", "*");
        //             res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //             res.statusCode = 200;
        //             res.end(content);
        //         });
        // });
        this.io = serverIo(this.server, { origin: '*:*', transport:['websocket']});
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
