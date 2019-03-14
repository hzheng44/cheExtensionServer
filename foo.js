var assert = require('assert');
var nodeServer = require('./src/server.js');
var io = require('socket.io-client')
var config = require('./config/config.js');

var socket1 = io.connect('http://localhost:8888');
var socket2 = io.connect('http://localhost:8888');

socket1.emit('update', 'test');
socket2.on('update', (msg) => {
    console.log(msg);
});
