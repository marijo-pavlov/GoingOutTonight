import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, browserHistory} from 'react-router';
import Home from './components/Home';
import auth from './components/auth';

render(
	<Router history={browserHistory}>
		<Route component={Home} path="/" />
	</Router>, 
	document.getElementById('react-container')
);