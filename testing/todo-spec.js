describe('quizitive user login and room login', function() {
	var loggedIn = false;

	beforeEach(function() {
		browser.get('http://in.quizitive.net');
		if (loggedIn) {
			element(by.css('.blue-button')).click();
			return;
		}
	});

	it('logs in a test user', function() { //This will initialize
		element(by.css('.blue-button')).click().then(function() {
			return browser.wait(protractor.until.elementLocated(by.tagName('form')), 2500);
		}).then(function() {
			var form = browser.driver.findElement(by.tagName('form'));
			browser.driver.findElement(by.id('a0-signin_easy_email')).sendKeys('test1@quizitive.net');
			browser.driver.findElement(by.id('a0-signin_easy_password')).sendKeys('testtest');
			form.submit();
			return browser.wait(protractor.until.elementLocated(by.css('.blue-button')), 2500);
		}).then(function() {
			loggedIn = true;
			expect(browser.getCurrentUrl()).toEqual('http://in.quizitive.net/room-sel');
		});
	});

	it('navigates to custom room', function() {
		element(by.id('roomNameInput')).sendKeys('protractorTest');
		element.all(by.css('.blue-button')).first().click().then(function() {
			return browser.wait(protractor.until.elementLocated(by.id('submitButton')), 2500);
		}).then(function() {
			expect(browser.getCurrentUrl()).toEqual('http://in.quizitive.net/chat-room/protractortest');
		});
	});

	it('navigates to generated room when custom clicked but left blank', function() {
		var room = [];
		element.all(by.css('.blue-button')).last().getText().then(function(text) {
			room = text.split(' ');
		}).then(function() {
			return element.all(by.css('.blue-button')).first().click();
		}).then(function() {
			return browser.wait(protractor.until.elementLocated(by.id('submitButton')), 2500);
		}).then(function() {
			expect(browser.getCurrentUrl()).toEqual('http://in.quizitive.net/chat-room/' + room[room.length - 1].toLowerCase());
		});
	});

	it('navigates to generated room when generated room clicked', function() {
		var room = [];
		element.all(by.css('.blue-button')).last().getText().then(function(text) {
			room = text.split(' ');
		}).then(function() {
			return element.all(by.css('.blue-button')).last().click();
		}).then(function() {
			return browser.wait(protractor.until.elementLocated(by.id('submitButton')), 2500);
		}).then(function() {
			expect(browser.getCurrentUrl()).toEqual('http://in.quizitive.net/chat-room/' + room[room.length - 1].toLowerCase());
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
			"Room Name",
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
