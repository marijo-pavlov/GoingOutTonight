var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/nightlife-app');

var db = mongoose.connection;

var UserSchema = new Schema({
	twitterId: {
		type: String
	},
	username: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);