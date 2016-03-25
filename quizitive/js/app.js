/* global angular, io */
var app = angular.module('quizitive', ['angular-jwt', 'ngRoute', 'routeStyles', 'ngTouch'])
		.config(function ($routeProvider, $httpProvider, $locationProvider) {
				$routeProvider.when('/', {
						templateUrl: '/templates/quizitive-splash.temp.html',
						controller: 'loginController',
						css: 'css/login-styles.css'
				});

				$routeProvider.when('/chat-room/:room', {
						templateUrl: '/templates/quizitive-room.temp.html',
						controller: 'quizitiveRoomController',
						css: 'css/quizitive-room.css'
				});

				$routeProvider.when('/admin/:room', {
						templateUrl: '/templates/quizitive-room-admin.temp.html',
						controller: 'quizitiveRoomAdminController',
						css: 'css/quizitive-room.css'
				});

				$routeProvider.when('/room-sel', {
						templateUrl: '/templates/room-sel.temp.html',
						controller: 'roomSelController',
						css: 'css/login-styles.css'
				});

				$routeProvider.when('/token/:token', {
						templateUrl: '/templates/blank.temp.html',
						controller: 'tokenController'
				});

				$locationProvider.html5Mode(true);
		});

app.factory('socket', function (store) {
		console.log('creating socket');
		var socket = io.connect();
		socket.emit('authenticate', {
				token: store.get('auth-token')
		});
		return socket;
});

app.service('store', function($window) {
	var localStorage = $window.localStorage;

	this.get = function(key) {
		return localStorage[key];
	};

	this.set = function(key, value) {
		return localStorage.setItem(key, value);
	};

	this.remove = function(key) {
		return localStorage.removeItem(key);
	};
});
