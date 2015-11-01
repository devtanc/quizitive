// Twilio Credentials
var accountSid = 'ACc0822a8626e4b1194232ac6ec9ae69f3';
var authToken = 'f89f7be4a036b19dd9e95ee120ca9289';

//require the Twilio module and create a REST client
module.exports = require('twilio')(accountSid, authToken);
