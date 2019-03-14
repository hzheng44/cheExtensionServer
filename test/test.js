var assert = require('assert');
var nodeServer = require('../src/server.js');
var io = require('socket.io-client')
var config = require('../config/config.js');

describe('hooks', () => {
    before(() => {
        //var server = new nodeServer();
        //server.listen();
    });

    after(() => {
        //server.close();
    });
})

describe('/', () => {
    it('should see message echoed across clients', (done) => {
        var socket1 = io.connect(`http://${config.app.host}:${config.app.port}`);
        var socket2 = io.connect(`http://${config.app.host}:${config.app.port}`);

        var testMsg = 'test'
        var out;
        socket1.emit('update', 'test');
        socket2.on('update', (msg) => {
            assert.equal(msg, testMsg)
            out = msg;
        });

        assert.equal('test', out)
        done();
    });
});

