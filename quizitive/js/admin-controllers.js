var adminControllers = angular.module('quizitive');

adminControllers.controller('quizitiveRoomAdminController', function ($route, $location, $scope, socket, store, $routeParams) {
    $scope.room = $routeParams.room;
    $scope.currentQuestion = 0;
    $scope.correctAnswer = -1;
    var newQuestion = false;
    var urlMatcher = /[^a-zA-Z0-9-_]/i;

    checkRoute();

    function checkRoute() { //This standardizes the names of the rooms to make sure there are no issues
        console.log("Room: " + $scope.room);
        if ($scope.room.replace(urlMatcher, '') != $scope.room) {
            do {
                $scope.room = $scope.room.replace(urlMatcher, '');
            } while ($scope.room.replace(urlMatcher, '') != $scope.room);
            $location.path('/admin/' + $scope.room);
        } else if ($routeParams.room.toLowerCase() != $routeParams.room) {
            $location.path('/admin/' + $routeParams.room.toLowerCase());
        } else {
            //User joins room
        }
    }

    $scope.logout = function () {
        store.remove('auth-token');
    };

    $scope.selectQuestion = function(index) {
        $scope.currentQuestion = index;
    };

    $scope.selectNextQuestion = function() {
        $scope.selectQuestion($scope.currentQuestion + 1);
    };

    $scope.selectPrevQuestion = function() {
        $scope.selectQuestion($scope.currentQuestion - 1);
    };

    $scope.selectAnswer = function(index) {
        $scope.questionList[$scope.currentQuestion].correctAnswer = index.toString();
    };

    $scope.createQuestion = function() {
        $scope.questionList.push({
            questionID:'NEW_QUESTION',
            questionText: 'This question was just created',
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
            correctAnswer: '-1',
            readOnly: false
        });
        $scope.currentQuestion = $scope.questionList.length - 1;
        newQuestion = true;
    };

    //SOCKET STUFF
    $scope.sendQuestion = function () {
        if (newQuestion) {
            socket.emit('sendQuestion', {
                question: $scope.questionList[$scope.questionList.length - 1],
                room: $scope.room,
                token: store.get('auth-token')
            });
            newQuestion = false;
        }
    };

    socket.on('err', function (err) {
        if (err.name === 'TokenExpiredError') {
            $location.path('/');
        }
        console.log(err.message);
    });

    $scope.questionList = [
        {
            questionID:'000-000-000-001',
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
            correctAnswer: '0',
            readOnly: true
        },
        {
            questionID:'000-000-000-002',
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
            correctAnswer: '1',
            readOnly: true
        },
        {
            questionID:'000-000-000-003',
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
            correctAnswer: '2',
            readOnly: true
        }
    ];
});
