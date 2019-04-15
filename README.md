# Che Shared Editor Backend Server

This server functions as the backend for the Che Shared Editor project. Its main functionality is to connect users and stream edits across clients. The current design uses the socket.io package to connect clients in the same namespace in order to broadcast edits across an n-way connection between editors.

## Useage

socket.io allows you to name events on a call of the `emit` function. We leverage this to define the type of messages being sent from editor to editor. 

### Initializing a Connection

On an `emit` call of a `session` event, the backend server will add the socket into the namespace given by the contents of the emit call. 

The intention behind this design is for the che editor to issue the person initializing the connection a random token which can be sent by instant message or email to the other client, which will subsequently be used on the opposite end of the connection to connect to the same paired editing session.

### Sending an edit

On an `emit` call of the `update` event, the server will simply broadcast the message body to all other sockets in the same namespace.

### Disconnecting

Sending an `emit` call with the `disconnect` event will delete the socket from its namespace and remove the socket and its corresponding key from the dictionary contained in the server.

### End to End example

```
var key = "token";
var socket1 = io.connect(url);
var socket2 = io.connect(url);

// Both sockets establishing the same key for their session
socket1.emit('session', key);
socket2.emit('session', key);

// Socket 1 streams an update to Socket 2
socket1.emit('update', 'your message here');

// This code located clientside to determine 
// what to do with recieved edits
socket2.on(update, (msg) => {
        console.log(msg);
});
```

## Linting

Run `jshint` in root directory to lint the entire repository.
