/* global require, __dirname, process, setTimeout */

if(process.env.NODE_ENV != 'development' && process.env.NODE_ENV != 'production') {
	throw 'Please specify NODE_ENV as development or production';
}

require('config-envy')({
	env: process.env.NODE_ENV,
	cwd: process.cwd(),
	localEnv: '.env',
	overrideProcess: false,
	silent: false,
});

//GLOBAL ENV
var TWILIO_ACCOUNTSID = process.env.TWILIO_ACCOUNTSID;
var TWILIO_AUTHTOKEN = process.env.TWILIO_AUTHTOKEN;
var TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || 7200; //sec
var SOCKET_AUTH_TIMEOUT = process.env.SOCKET_AUTH_TIMEOUT || 500; //ms
var PORT_NUMBER = process.env.PORT || 40569;
var TOKEN_ISSUED_BY = process.env.TOKEN_ISSUED_BY || 'Quizitive';
var TOKEN_ALG = process.env.TOKEN_ALG || 'RS256';
var COUCH_URL = process.env.DB_BASE_URL;

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({ extended: false });
var jwt = require('jsonwebtoken');
var fs = require('fs');
var twilio = require('twilio')(TWILIO_ACCOUNTSID, TWILIO_AUTHTOKEN);

var pp = require('passport');
var Auth0Strategy = require('passport-auth0');
var strategy = new Auth0Strategy({
		domain: process.env.AUTH0_DOMAIN,
		clientID: process.env.AUTH0_CLIENT_ID,
		clientSecret: process.env.AUTH0_CLIENT_SECRET,
		callbackURL: process.env.AUTH0_CALLBACK_URL
}, function(accessToken, refreshToken, extraParams, profile, done) {
		return done(null, profile);
});
var passport = pp.use(strategy);

//GLOBALS
//Keyfiles
var LOCAL_PRIVATE_KEY = fs.readFileSync(__dirname + '/keyfiles/local-private-key.key');
var LOCAL_PUBLIC_KEY = fs.readFileSync(__dirname + '/keyfiles/local-public-key.pem');
//var AUTH0_PUBLIC_KEY = fs.readFileSync('./keyfiles/wdd-public-key.pem');

var questionDB = [
		{
				questionID:"000-000-000-001",
				questionText: "This is a question with a bunch of words in it to simulate a question that also has many words in it. How wonderful is that?",
				answers: [
						{
								answerText: "Answer 1",
								selected: false
						},
						{
								answerText: "Answer 2",
								selected: false
						},
						{
								answerText: "Answer 3",
								selected: false
						},
						{
								answerText: "Answer 4",
								selected: false
						}
				],
				correctAnswer: "0",
				readOnly: true,
				answeredUsers:[]
		},
		{
				questionID:"000-000-000-002",
				questionText: "This is a ANOTHER question with a bunch of words in it to simulate ANOTHER question that also has many words in it. How wonderful is that?",
				answers: [
						{
								answerText: "Answer 1",
								selected: false
						},
						{
								answerText: "Answer 2",
								selected: false
						},
						{
								answerText: "Answer 3",
								selected: false
						},
						{
								answerText: "Answer 4",
								selected: false
						}
				],
				correctAnswer: "1",
				readOnly: true,
				answeredUsers:[]
		},
		{
				questionID:"000-000-000-003",
				questionText: "This is a YET ANOTHER question with a bunch of words in it to simulate YET ANOTHER question that also has many words in it. How wonderful is that?",
				answers: [
						{
								answerText: "Answer 1",
								selected: false
						},
						{
								answerText: "Answer 2",
								selected: false
						},
						{
								answerText: "Answer 3",
								selected: false
						},
						{
								answerText: "Answer 4",
								selected: false
						}
				],
				correctAnswer: "2",
				readOnly: true,
				answeredUsers:[]
		}
];
var adminSocket = null;

app.use(passport.initialize());

server.listen(PORT_NUMBER, function(){
	console.log('listening on localhost port ' + PORT_NUMBER);
});

app.get('/auth0-login', passport.authenticate('auth0', {}), function (req, res) {
	//Redirect on callback
		console.log('Never gets here');
});

app.get('/', function (req, res) {
		app.use(express.static(__dirname + '/quizitive'));
		res.sendFile(__dirname + '/quizitive/quizitive-room-service.html');
});

app.get('/chat-room/*', function(req, res) {
	res.redirect('/#' + req.originalUrl);
});

app.get('/admin/*', function(req, res) {
	res.redirect('/#' + req.originalUrl);
});

app.get('/auth0-login-callback', passport.authenticate('auth0', { failureRedirect: '/auth0-login', session: false }), function(req, res) { //session:false is key without express sessions
		if (!req.user) {
			throw new Error('user null');
		}
//    console.log(JSON.stringify(req.user));
		console.log('Issuing token');
		var claim = {
				userID: req.user.id,
				role: req.user._json.quizitive.role
		};
		var options = {
				issuer: TOKEN_ISSUED_BY,
				expiresIn: TOKEN_EXPIRATION,
				algorithm: TOKEN_ALG
		};
		var token = jwt.sign(claim, LOCAL_PRIVATE_KEY, options);
		res.redirect("/#/token/" + token);
	}
);

app.post('/sms', urlEncodedParser, function(req, res) {
	//Endpoint to handle sms responses through twilio
	console.log('SMS Endpoint Accessed');
	res.type('text/plain');
	switch(req.body.Body) {
		case 'A':
		case 'a':
			adminSocket.emit('textUpdate', { message: 'Correct answer from '});
			res.send('Correct!');
			break;
		default:
			res.send('Incorrect!');
			break;
	}
});

app.post('/sms-status', function(req, res) {
	//Endpoint to handle sms responses through twilio
	console.log('SMS Status Endpoint Accessed');
	console.log(JSON.stringify(req));
});

var hasAnswered = function(users, user) {
		for (var i = 0; i < users.length; i++) {
				if (users[i].userID === user) { return true; }
		}
		return false;
};

io.sockets.on('connection', function (socket) {
		console.log("Socket connected with ID: " + socket.id);
		socket.authorized = false;
		socket.isAdmin = false;
		socket.userID = '';

		setTimeout(function(){
				//If the socket didn't authenticate, disconnect it after [SOCKET_AUTH_TIMEOUT] ms
				if (!socket.authorized) {
						console.log("Disconnecting socket ID: ", socket.id);
						socket.disconnect('err', { message: 'Authentication Timeout' });
				}
		}, SOCKET_AUTH_TIMEOUT);

		socket.on('authenticate', function(data) {
				if(data.token === null){
						socket.emit('err', { message:'No token found for authentication' });
						return;
				}
				if (TOKEN_ALG === 'RS256') {
						jwt.verify(data.token, LOCAL_PUBLIC_KEY, function(err, payload) {
								if (err) {
										socket.emit('err', err);
								} else {
										console.log('User authenticated with token'); // + msg.token
										socket.authorized = true;
										socket.userID = payload.userID;
										console.log(payload.userID);
										if (payload.role === 'admin') {
												socket.isAdmin = true;
												console.log('New admin connected');
												adminSocket = socket; //Store in parent scope to access on any connection
										} else {
												console.log('New user connected');
										}
								}
						});
				} else {
						socket.emit('err', { message: 'Algorithm mismatch on server side' });
				}
		});

		socket.on('joinRoom', function(data) {
				console.log('Request to join room [' + data.room + '] received');
				if (!socket.authorized) {
						console.log('Socket authentication error');
						socket.emit('err', { message:'You are not authorized to perform this function.' });
						return;
				}
				socket.join(data.room, function(err) {
						console.log('Socket joined room [' + data.room + ']');
						console.log('Socket is in rooms: ' + socket.rooms);
						if (err) { socket.emit('err', err); }
						if (socket.rooms.length > 2) {
								console.log('Too many rooms');
								for (var i = 1; i < socket.rooms.length - 1; i++) {
										console.log('Socket is being booted from room [' + socket.rooms[i] + ']');
										socket.leave(socket.rooms[i]);
								}
						}
				});
		});

		socket.on('disconnect', function () {
				socket.authorized = false;
				console.log('user disconnected');
		});

		socket.on('sendQuestion', function (data) {
				console.log('Question received for sending to all users');
				if (!socket.authorized || !socket.isAdmin) {
						console.log('Socket authentication error');
						socket.emit('err', { message:'You are not authorized to perform this function.' });
						return;
				}
				//Put question into question DB and add answered users tracking
				data.question.answeredUsers = [];
				questionDB.push(data.question);
				console.log('QuestionDB length: ' + questionDB.length);
				//Broadcast new question to all users
				console.log('Broadcasting to room: ' + data.room);
				socket.to(data.room).emit('sendQuestion', {
						question: {
								questionID: data.question.questionID,
								questionText: data.question.questionText,
								answers: data.question.answers,
								readOnly: false,
								correct: 'neutral'
						}
				});
		});

		socket.on('sendAnswer', function (data){
				console.log('Answer received to confirm and send back to user and admin');
				if (!socket.authorized) {
						console.log('Socket authentication error');
						socket.emit('err', { message:'This connection is not currently authorized. Please log in again.' });
						return;
				}
				console.log('QuestionID: ' + data.questionID);
				for (var i = 0; i < questionDB.length; i++) {
						console.log('Checking match to: ' + questionDB[i].questionID);
						if(questionDB[i].questionID === data.questionID) {
								if (!hasAnswered(questionDB[i].answeredUsers, socket.userID)) {
										socket.emit('answerConfirm', {
												questionID: data.questionID,
												correct: (questionDB[i].correctAnswer == data.answer)
										});
										questionDB[i].answeredUsers.push({
												userID: socket.userID
										});
										return;
										//emit answer to admin (need to know who admin is from this socket somehow)
								} else {
										console.log('User already answered');
										socket.emit('err', { message: 'You cannot answer a question twice' });
										return;
								}
						}
				}
				console.log('Question ID not found');
				socket.emit('err', { message: 'Invalid question ID' });
		});

		socket.on('SMS', function(data) {
			console.log('Request to send SMS');
			if (!socket.authorized || !socket.isAdmin) {
					console.log('Socket authentication error');
					socket.emit('err', { message:'You are not authorized to perform this function.' });
					return;
			}
			console.log(JSON.stringify(data));
			twilio.messages.create({
					to: "+1" + data.to,
					from: "+18582957849",
					body: data.body,
				}, function(err, message) {
					console.log(message.sid);
			});
		});
});
