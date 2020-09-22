var server = require('websocket').server, http = require('http');

var socket = new server({  
  httpServer: http.createServer().listen(8080)
});

const connections = [];

init = (connection) => {
  console.log(`${connection.remoteAddress} connected - Protovol Version ${connection.webSocketVersion}`);
  if (connections.length == 0) {
    connection.sendUTF('created');
  } else {
    connection.sendUTF('joined');
  }
  connections.push(connection);
};

socket.on('request', (request) => {

  const connection = request.accept(null, request.origin);
  init(connection);

  connection.on('message', (message) => {
    console.log(message.utf8Data);
    connections.forEach((destination) => {
      destination.sendUTF(message.utf8Data);
    })
  });

  connection.on('close', (connection) => {
    console.log(`${connections.remoteAddress} disconnected`);
    let index = connections.indexOf(connection);
    if (index !== -1 ) {
      connections.splice(index, 1);
    }
  });

});
