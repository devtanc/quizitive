/* global angular */

var userControllers = angular.module('quizitive');

userControllers.controller('quizitiveRoomController', function ($route, $location, $scope, socket, store, $routeParams) {
	$scope.room = $routeParams.room;
	$scope.currentQuestion = 0;
	$scope.currentAnswer = -1;
	var urlMatcher = /[^a-zA-Z0-9-_]/i;

	checkRoute();

	function checkRoute() { //This standardizes the names of the rooms to make sure there are no issues
		console.log("Room: " + $scope.room);
		if ($scope.room.replace(urlMatcher, '') != $scope.room) {
			do {
				$scope.room = $scope.room.replace(urlMatcher, '');
			} while ($scope.room.replace(urlMatcher, '') != $scope.room);
			$location.path('/chat-room/' + $scope.room);
		} else if ($routeParams.room.toLowerCase() != $routeParams.room) {
			$location.path('/chat-room/' + $routeParams.room.toLowerCase());
		} else {
			//User connected
		}
	}

	$scope.logout = function () {
		store.remove('auth-token');
	};

	$scope.selectQuestion = function (index) {
		if (index >= $scope.receivedQuestions.length) {
			return;
		}
		$scope.currentQuestion = index;
		$scope.currentAnswer = -1;
	};

	$scope.selectNextQuestion = function () {
		$scope.selectQuestion($scope.currentQuestion + 1);
	};

	$scope.selectPrevQuestion = function () {
		$scope.selectQuestion($scope.currentQuestion - 1);
	};

	$scope.selectAnswer = function (index) {
		if ($scope.receivedQuestions[$scope.currentQuestion].readOnly) {
			return;
		}
		$scope.currentAnswer = index;
	};

	//SOCKET STUFF
	$scope.sendAnswer = function () {
		if ($scope.currentAnswer > -1) {
			socket.emit('sendAnswer', {
				questionID: $scope.receivedQuestions[$scope.currentQuestion].questionID,
				answer: $scope.currentAnswer,
				room: $scope.room,
				token: store.get('auth-token')
			});
		}
	};

	socket.on('answerConfirm', function (msg) {
		for (var i = 0; i < $scope.receivedQuestions.length; i++) {
			if ($scope.receivedQuestions[i].questionID === msg.questionID) {
				$scope.receivedQuestions[i].correct = msg.correct ? 'correct' : 'incorrect';
				$scope.receivedQuestions[i].readOnly = true;
			}
		}
		$scope.$apply();
	});

	socket.on('sendQuestion', function (data) {
		console.log('Received question');
		$scope.receivedQuestions.push(data.question);
		$scope.$apply();
	});

	socket.on('err', function (err) {
		if (err.name === 'TokenExpiredError') {
			$location.path('/');
		}
		console.log(err.message);
	});

	$scope.receivedQuestions = [
		{
			questionID: '000-000-000-001',
			questionText: 'This is a question with a bunch of words in it to simulate a question that also has many words in it. How wonderful is that?',
			answers: [
				{
					answerText: 'Answer 1',
					selected: false
								},
				{
					answerText: 'Answer 2',
					selected: false
								},
				{
					answerText: 'Answer 3',
					selected: false
								},
				{
					answerText: 'Answer 4',
					selected: false
								}
						],
			readOnly: false,
			correct: 'neutral'
				},
		{
			questionID: '000-000-000-002',
			questionText: 'This is a ANOTHER question with a bunch of words in it to simulate ANOTHER question that also has many words in it. How wonderful is that?',
			answers: [
				{
					answerText: 'Answer 1',
					selected: false
								},
				{
					answerText: 'Answer 2',
					selected: false
								},
				{
					answerText: 'Answer 3',
					selected: false
								},
				{
					answerText: 'Answer 4',
					selected: false
								}
						],
			readOnly: false,
			correct: 'neutral'
				},
		{
			questionID: '000-000-000-003',
			questionText: 'This is a YET ANOTHER question with a bunch of words in it to simulate YET ANOTHER question that also has many words in it. How wonderful is that?',
			answers: [
				{
					answerText: 'Answer 1',
					selected: false
								},
				{
					answerText: 'Answer 2',
					selected: false
								},
				{
					answerText: 'Answer 3',
					selected: false
								},
				{
					answerText: 'Answer 4',
					selected: false
								}
						],
			readOnly: false,
			correct: 'neutral'
				}
		];
});
