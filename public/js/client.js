var quizitive = angular.module('quizitive', []);

quizitive.factory('socket', function($rootScope) {
  var socket = io.connect();
  return socket;
});

quizitive.controller('initController', function($scope, socket) {
  $scope.connected = "Not connected";
  $scope.adminID = null;
  $scope.socketID = null;

  function sendAnswer(answer) {
    socket.broadcast.to($scope.adminID).emit('sendAnswer', answer);
  };

  socket.on('connect', function() {
    $scope.connected = "You are connected!";
    $scope.socketID = socket.id;
    $scope.$apply();
  });

  socket.on('adminID', function(id) {
    $scope.adminID = id;
    $scope.$apply();
  });

  socket.on('beginQuiz', function() {
    console.log("Quiz Begin");
  });

  socket.on('sendQuestion', function(question) {
    console.log("Question received");
  });

  socket.on('endQuiz', function() {
    console.log("Quiz End");
  });

  socket.on('message', function(m) {
    $scope.messageBody = m.body;
    $scope.$apply();
  });
});
