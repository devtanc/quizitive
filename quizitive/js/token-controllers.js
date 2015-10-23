var tokenControllers = angular.module('quizitive');

tokenControllers.controller('tokenController', function($routeParams, store, $location) {
    console.log($routeParams.token);
    store.set('auth-token', $routeParams.token);
    $location.path('/room-sel');
});
