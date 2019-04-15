var assert = require('assert');
var nodeServer = require('../src/server.js');
var io = require('socket.io-client');
var config = require('../config/config.js');
var sinon = require('sinon');

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

        var key = "room";
        socket1.emit('session', key);
        socket2.emit('session', key);
        socket1.emit('update', testMsg);
    });

    it('should be able to handle simultaneous connections', (done) => {
        var socket1 = io.connect(url);
        var socket2 = io.connect(url);
        var socket3 = io.connect(url);
        var socket4 = io.connect(url);

        var testMsg = 'test';
        var testMsg2 = 'test2';
        var spy = sinon.spy();

        socket2.on('update', (msg) => {
            spy();
            assert.equal(msg, testMsg);
            socket3.emit('update', testMsg2);
            socket1.close();
            socket2.close();
        });
        socket4.on('update', (msg) => {
            spy();
            assert.equal(msg, testMsg2);
            socket3.close();
            socket4.close();
            sinon.assert.calledTwice(spy);
            done();
        });

        var key = "room";
        var key2 = "room2";
        socket1.emit('session', key);
        socket2.emit('session', key);
        socket3.emit('session', key2);
        socket4.emit('session', key2);
        socket1.emit('update', testMsg);
    });
});

