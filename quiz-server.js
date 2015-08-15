var express = require('express');
var app = express();
var http = require('http');
var port = process.env.PORT || 3000;
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

server.listen(port, function() {
  console.log("Listening on port: " + port);
});

var adminID = null;

io.use(function(socket, next) {
  if(io.sockets.sockets.length == 0) {
    adminID = socket.id;
    socket.emit('message', {
      body:'Welcome Admin!'
    });
  } else {
    socket.emit('message', {
      body:'Welcome User'
    });
    socket.emit('adminID', adminID);
  };

  next();
});

io.on('connection', function(socket) {
  console.log('User connected with Socket ID: ' + socket.id);
  console.log(io.sockets.sockets.length);

  io.emit('beginQuiz');
  socket.on('disconnect', function() {
    console.log(io.sockets.sockets.length);
  });
});
