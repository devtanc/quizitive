var loginControllers = angular.module('quizitive');

loginControllers.controller('loginController', function ($route, $scope, $http, store, $location) {
    $scope.login = function () {
        window.location = 'http://ec2-54-201-246-23.us-west-2.compute.amazonaws.com:8080/auth0-login';
    };
});

loginControllers.controller('roomSelController', function ($route, $scope, store, $location, jwtHelper, $routeParams) {
    store.set('auth-token', $routeParams.token);
    console.log(store.get('auth-token'));
    $scope.roomName = '';
    $scope.generatedRoom = '';

    $scope.generateRoomName = function () {
        for (var i = 0; i < 4; i++) {
            $scope.generatedRoom += hexGen[Math.floor((Math.random() * hexGen.length))].toUpperCase();
        }
        console.log("Generated Room: " + $scope.generatedRoom);
    };

    $scope.goToRoom = function (roomName) {
        var pathBegin = '';
        if (jwtHelper.decodeToken(store.get('auth-token')).role == 'admin') {
            pathBegin = '/admin/';
        } else {
            pathBegin = '/chat-room/';
        }
        if (roomName) {
            $location.path(pathBegin + roomName.toLowerCase());
            socket.emit('joinRoom', {
                token: store.get('auth-token'),
                room:roomName.toLowerCase()
            });
        } else {
            $location.path(pathBegin + $scope.generatedRoom.toLowerCase());
            socket.emit('joinRoom', {
                token: store.get('auth-token'),
                room:$scope.generatedRoom.toLowerCase()
            });
        }
    };

    var hexGen = [
        'a', 'c', 'e', 'f', 'g', 'h', 'j', 'k', 'q', 'r', 's', 'u', 'v', 'w', 'x', 'y', 'z',
        '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ]; //Confusing characters removed to facilitate communication of room names

    $scope.generateRoomName();
});
