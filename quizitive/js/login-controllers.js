var loginControllers = angular.module('quizitive');

loginControllers.controller('loginController', function ($scope, store, $location, jwtHelper) {
		$scope.login = function () {
				var currentToken = store.get('auth-token');
				if (currentToken && !jwtHelper.isTokenExpired(currentToken)) {
					//If a valid token is found, redirect to room selection page
					$location.path('/room-sel');
				} else {
					window.location = 'http://' + window.location.hostname + '/auth0-login';
				}
		};
});

loginControllers.controller('roomSelController', function ($scope, store, socket, $location, jwtHelper) {
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
						socket.emit('joinRoom', {
								token: store.get('auth-token'),
								room:roomName.toLowerCase()
						});
						$location.path(pathBegin + roomName.toLowerCase());
				} else {
						socket.emit('joinRoom', {
								token: store.get('auth-token'),
								room:$scope.generatedRoom.toLowerCase()
						});
						$location.path(pathBegin + $scope.generatedRoom.toLowerCase());
				}
		};

		var hexGen = [
				'a', 'c', 'e', 'f', 'g', 'h', 'j', 'k', 'q', 'r', 's', 'u', 'v', 'w', 'x', 'y', 'z',
				'1', '2', '3', '4', '5', '6', '7', '8', '9'
		]; //Confusing characters removed to facilitate communication of room names

		$scope.generateRoomName();
});
