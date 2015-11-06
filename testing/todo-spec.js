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
});
