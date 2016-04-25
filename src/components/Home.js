import React from 'react';
import auth from './auth';
import {findDOMNode} from 'react-dom';
import request from 'superagent';

var Home = React.createClass({
	getInitialState(){
		return  {
			loggedIn: auth.loggedIn(),
			search: [],
			query: localStorage.query ? localStorage.query : null,
			message: false
		}
	},
	updateAuth(loggedIn, username = false){
		this.setState({
			loggedIn: loggedIn,
			username: username
		});
	},
	componentWillMount(){
		auth.onChange = this.updateAuth;
		auth.login();
	},
	componentDidMount(){
		var self = this;

		if(this.state.query){
			request
				.post('/api/searchplaces')
				.send({
					query: this.state.query
				}).end(function(err, res) {
					if(res.status === 404){
						self.setState({
							message: 'We have not been able to find any result.',
							search: []
						});
					}else if(res.body.success){
						self.setState({
							search: res.body.businesses,
							message: false
						});
					}
				});
		}
	},
	searchPlaces(event){
		event.preventDefault();
		var query = findDOMNode(this.refs.query).value;
		var self = this;

		if(query){
			localStorage.query = query;

			request
				.post('/api/searchplaces')
				.send({
					query: query
				}).end(function(err, res) {
					console.log(res);
					if(res.status === 404){
						self.setState({
							message: 'We have not been able to find any result.',
							search: []
						});
					}else if(res.body.success){
						self.setState({
							search: res.body.businesses,
							message: false
						});
					}
				});
		}

	},
	toggleGoing(place){
		var self = this;

		request
			.post('/api/togglegoing')
			.send({
				place: place,
				token: auth.getToken()
			})
			.end(function(err, res){
				if(err) throw err;

				if(res.body.success){
					var tempSearch = self.state.search;
					tempSearch[tempSearch.indexOf(place)].goings = res.body.count; 

					self.setState({
						search: tempSearch
					});
				}
			});
	},
	eachPlace(place, i){
		return (
			<div className="col-md-6 col-xs-12" key={i}>
				<div className="row">
					<div className="col-xs-12"><h3>{place.name}</h3></div>
					<div className="col-xs-4">
						<img src={place.image_url} alt={place.name} />
					</div>
					<div className="col-xs-8">
						<p>
							{this.state.loggedIn ? (
								<button className="btn btn-info pull-right" onClick={this.toggleGoing.bind(null, place)}>{place.goings} Going</button>
								) : (
								<a href="/api/auth/twitter" className="btn btn-info pull-right">{place.goings} Going</a>
								) }
						</p>
						<p>{place.snippet_text}</p>
					</div>
				</div>
			</div>
		);
	},
	render(){
		return(
			<div className="wrapper">
				<div className="jumbotron homebg">
					<div className="container">
				  		<div className="col-xs-12">
				 			<h1>Hello to GoingOutTonight!</h1>
							<p>GoingOutTonight is a service for checking out great places.</p>
						</div>
				  	</div>
				</div>

				<div className="container content">

				{this.state.message && (
					<div className="col-xs-12">
						<p className="alert alert-info">{this.state.message}</p>
					</div> 
				)}

					<div className="col-xs-12">
						<form onSubmit={this.searchPlaces} id="searchPlacesForm">
							<div className="form-group has-feedback">
							  <label>In what city are you currently?</label>
							  <input ref="query" type="text" className="form-control" placeholder="Where are you?" defaultValue={this.state.query} required />
							  <span className="glyphicon glyphicon-search form-control-feedback searchIcon" aria-hidden="true"></span>
							</div>
							<input type="submit" value="Search" className="btn btn-primary"/>
						</form>
					</div>

					{this.state.search.map(this.eachPlace)}

				</div>
			</div>
		);
	}
});

module.exports = Home;