/* global describe, element, by, browser, beforeEach, it, protractor, expect */

describe('quizitive app tests', function() {
	var HOST_URL = 'http://192.168.1.50:40569';
	var TIMEOUT = 3500;

	describe('quizitive user login and room login', function() {
		var loggedIn = false;
		var loginSkipTestComplete = false;

		beforeEach(function() {
			browser.get(HOST_URL);
			if (loggedIn && loginSkipTestComplete) {
				element(by.css('.blue-button')).click();
				return;
			}
		});

		it('logs in a test user to the room selection page', function() { //This will initialize
			element(by.css('.blue-button')).click().then(function() {
				return browser.wait(protractor.until.elementLocated(by.tagName('form')), TIMEOUT);
			}).then(function() {
				var form = browser.driver.findElement(by.tagName('form'));
				browser.driver.findElement(by.id('a0-signin_easy_email')).sendKeys('test1@quizitive.net');
				browser.driver.findElement(by.id('a0-signin_easy_password')).sendKeys('testtest');
				form.submit();
				return browser.wait(protractor.until.elementLocated(by.css('.blue-button')), TIMEOUT);
			}).then(function() {
				loggedIn = true;
				expect(browser.getCurrentUrl()).toEqual(HOST_URL + '/room-sel');
			});
		});

		it('skips login if token already exists', function() {
			element(by.css('.blue-button')).click().then(function() {
				return browser.wait(protractor.until.elementLocated(by.css('.blue-button')), TIMEOUT);
			}).then(function() {
				loginSkipTestComplete = true;
				expect(browser.getCurrentUrl()).toEqual(HOST_URL + '/room-sel');
			});

		});

		it('navigates to custom room', function() {
			element(by.id('roomNameInput')).sendKeys('protractorTest');
			element.all(by.css('.blue-button')).first().click().then(function() {
				return browser.wait(protractor.until.elementLocated(by.id('submitButton')), TIMEOUT);
			}).then(function() {
				expect(browser.getCurrentUrl()).toEqual(HOST_URL + '/chat-room/protractortest');
			});
		});

		it('navigates to generated room when custom clicked but left blank', function() {
			var room = [];
			element.all(by.css('.blue-button')).last().getText().then(function(text) {
				room = text.split(' ');
			}).then(function() {
				return element.all(by.css('.blue-button')).first().click();
			}).then(function() {
				return browser.wait(protractor.until.elementLocated(by.id('submitButton')), TIMEOUT);
			}).then(function() {
				expect(browser.getCurrentUrl()).toEqual(HOST_URL + '/chat-room/' + room[room.length - 1].toLowerCase());
			});
		});

		it('navigates to generated room when generated room clicked', function() {
			var room = [];
			element.all(by.css('.blue-button')).last().getText().then(function(text) {
				room = text.split(' ');
			}).then(function() {
				return element.all(by.css('.blue-button')).last().click();
			}).then(function() {
				return browser.wait(protractor.until.elementLocated(by.id('submitButton')), TIMEOUT);
			}).then(function() {
				expect(browser.getCurrentUrl()).toEqual(HOST_URL + '/chat-room/' + room[room.length - 1].toLowerCase());
			});
		});

		it('warns only on values that do not match the regex /^[a-zA-Z0-9-_]+$/', function() {
			var validArray = [
				"valid",
				"VaLiD",
				"VALID",
				"valid1",
				"123456789",
				"qwertyuiopasdfghjklzxcvbnm1234567890",
				"-_-",
				"5_a-P",
				"quizitive",
				"last_one-to_test-HERE_123"
			];
			var invalidArray = [
				"!@#$%^&*()",
				"Room.Name",
				"what?",
				"UPPERlower_lowerUPPER^",
				"500%",
				"The Big Room of Knowledge",
				"-_-_-_-_=",
				"this*is*not*okay",
				"Jack's",
				"T@lon"
			];
			var input = element(by.id('roomNameInput'));
			for (var i = 0; i < validArray.length; i++) {
				input.clear().sendKeys(validArray[i]);
				expect(input.getAttribute('class')).toContain('ng-valid');
			}
			for (var i = 0; i < invalidArray.length; i++) {
				input.clear().sendKeys(invalidArray[i]);
				expect(input.getAttribute('class')).toContain('ng-invalid');
			}
		});
	});

	//Relies on the fact that the login from earlier is still in effect
	describe('quizitive room page user experience', function() {
		beforeEach(function() {
			browser.get(HOST_URL + '/#/chat-room/test');
		});

		it('should start in a valid room', function() {
			expect(browser.getCurrentUrl()).toEqual(HOST_URL + '/chat-room/test');
		});

		it('initial selected question should be the first one', function() {
			element.all(by.id('questionDot')).then(function(dots) {
				dots.forEach(function(element) {
					element.getAttribute('class').then(function(classAttr) {
						if(classAttr.indexOf('selected') > -1) {
							expect(dots[0] == element);
						}
					});
				});
			});
		});

		it('should change questions when an unselected dot is pressed', function() {
			element.all(by.id('questionDot')).then(function(dots) {
				dots[1].click().then(dots.forEach(function(element) {
					element.getAttribute('class').then(function(classAttr) {
						if(classAttr.indexOf('selected') > -1) {
							expect(dots[1] == element);
						}
					});
				}));
			});
		});
	});
});
