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
        this.sockMap= {};
        this.sockArr = []
    }

    listen() {
        this.io.on('connection', (socket) => {
            console.log(socket.id, ' connected');

            this.sockMap[socket.id] = socket
            this.sockArr.push(socket)

            socket.on('update', (msg) => {
                var i;
                console.log('update ', msg);
                for (i = 0; i < this.sockArr.length; i++) {
                    if (this.sockArr[i].id != socket.id) {
                        console.log('sending to ', this.sockArr[i].id);
                        this.sockArr[i].emit('update', msg);
                    }
                }
            });

            socket.on('disconnect', () => {
                var index = this.sockArr.indexOf(
                    this.sockMap[socket.id])
                if (index > -1) {
                    this.sockArr.splice(index, 1)
                }
                delete this.sockMap[socket.id]
            });
        });

        this.server.listen(config.app.port, function(){
            console.log(`listening on ${config.app.host}:${config.app.port}`);
        });
    }

    close() {
        this.server.close();
    }
}

module.exports = Server;
