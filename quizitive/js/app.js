var app = angular.module('quizitive', ['angular-storage', 'angular-jwt', 'ngRoute', 'routeStyles', 'ngTouch'])
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

        $routeProvider.when('/room-sel/:token', {
            templateUrl: '/templates/room-sel.temp.html',
            controller: 'roomSelController',
            css: 'css/login-styles.css'
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
