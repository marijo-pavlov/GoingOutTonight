var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.createConnection('mongodb://localhost/nightlife-app');

var UserSchema = require('./user').schema;

var PlaceSchema = new Schema({
		yelpId: {
			type: String
		},
		goings: [UserSchema]
});

var Place = module.exports = mongoose.model('Place', PlaceSchema);