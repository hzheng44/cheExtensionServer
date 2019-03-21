var assert = require('assert');
var nodeServer = require('../src/server.js');
var io = require('socket.io-client');
var config = require('../config/config.js');



const url = `http://${config.app.host}:${config.app.port}`;
describe('/', () => {
    var server;
    before(() => {
        server = new nodeServer();
        server.listen();
    });

    after(() => {
        server.close();
    });

    it('should see message echoed across clients', (done) => {
        var socket1 = io.connect(url);
        var socket2 = io.connect(url);

        var testMsg = 'test';
        socket2.on('update', (msg) => {
            assert.equal(msg, testMsg);
            socket1.close();
            socket2.close();
            done();
        });

        socket1.emit('update', testMsg);
    });
});

