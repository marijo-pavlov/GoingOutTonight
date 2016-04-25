var express = require('express');
var router = express.Router();
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var jwt = require('jwt-simple');
var yelp = require('node-yelp');

var User = require('../models/user');
var Place = require('../models/place');

const jwtSecretToken = 'n3tnr3it4t54mgrg';

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new Strategy({
    consumerKey: 'LR6AlAVbQmLGPt01veA9lpvLL',
    consumerSecret: 'Ssghm86E3g1djZ5gb0t6wXxHadsxWs3BfuvoMPZy8JqqRa9MAU',
    callbackURL: "http://127.0.0.1:3000/api/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, cb) {
  	User.findOne({ 'twitterId' : profile.id }, function(err, user) {
        if (err)
            return cb(err);

        if (user) {
            return cb(null, user); 
        } else {
            var newUser = new User({
            	twitterId: profile.id,
            	username: profile.username
            });

            newUser.save(function(err) {
                if (err)
                    throw err;
                return cb(null, newUser);
            });
        }
    });
  }
));

router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


router.get('/login', function(req, res, next){
	if(req.user){
		var payload = {
				iss: req.user._id
			};
		var token = jwt.encode(payload, jwtSecretToken);

		return res.json({
			username: req.user.username,
			token: token
		});
	}else{
		return res.status(401).end();
	}
});

router.get('/logout', function(req, res){
	req.logout();
	return res.status(200).end();
});

router.post('/searchplaces', function(req, res){
	var client = yelp.createClient({
	  oauth: {
	    "consumer_key": "rLfAk3iJFmoCPqjNShv5Pg",
	    "consumer_secret": "MZ7L9yjQD4ZR5jg9K8ToGGHoWrA",
	    "token": "RxZB3w7ZCDjO8wGMx23KrP9h1Y3ElTf0",
	    "token_secret": "fGqMG6htt84rvne02muO7RtVOLM"
	  },
	  httpClient: {
	    maxSockets: 20 
	  }
	});

	client.search({
		term: "Food,Drink,Restaurants,Pubs,Clubs",
		location: req.body.query
	}).then(function (data) {
		Place.find({}, function(err, places){
			if(err) throw err;

			var businesses = data.businesses;

			businesses.forEach(function(e, i){
				var found = places.find(function(element){
					return element.yelpId === e.id;
				});
				e.goings = found ? found.goings.length : 0;
			});

			return res.json({
				success: true,
				businesses: businesses
			});
		});
	}).catch(function (err) { 
		return res.status(404).end();
	});
});

router.post('/togglegoing', function(req, res){
	var userId = jwt.decode(req.body.token, jwtSecretToken).iss;

		User.findById(userId, function(err, user){
			if(err) throw err;

			Place.findOne({yelpId: req.body.place.id}, function(err, place){
				if(err) throw err;	

				if(!place){
					var newPlace = new Place({
						yelpId: req.body.place.id,
						goings: []
					});
					newPlace.goings.push(user);

					newPlace.save(function(err){
						if(err) throw err;

						Place.find({}, function(err, places){
							if(err) throw err;

							return res.json({
								success: true,
								count: newPlace.goings.length
							});
						});
						
					});
				}else{
					var found = place.goings.find(function(e, i){
						return String(e._id) === String(user._id);
					});

					if(found)
						place.goings.splice(place.goings.indexOf(found), 1);
					else
						place.goings.push(user._id);

					place.save(function(err){
						if(err) throw err;

						return res.json({
							success: true,
							count: place.goings.length
						});
					});
				}

			});		
	});	
});

module.exports = router;
