var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

var strategy = new Auth0Strategy({
		domain: 'wdd.auth0.com',
		clientID: 'iHQKzsK9m51CfCZ8NO7COLlj9ajYxozB',
		clientSecret: '2PTrwv59yMam6CDerMgqEZjBA7EVgKvxrJQjOHIi0Ue7zWbaCK8HOvA_3hbhD53C',
		callbackURL: 'http://christensenhome.myds.me:40569/auth0-login-callback'
}, function(accessToken, refreshToken, extraParams, profile, done) {
		return done(null, profile);
});

passport.use(strategy);

module.exports = passport;
