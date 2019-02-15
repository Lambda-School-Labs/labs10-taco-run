import React, { Component } from 'react';
import Auth from './components/auth/Auth.js';
import NotAuth from './components/auth/NotAuth';
import NoPage from './components/404/NoPage.js';
import { Route, withRouter } from 'react-router-dom';
import {connect} from 'react-redux';
import { Switch } from 'react-router-dom';

// --> Components List
import LandingPage from './components/landing/LandingPage';
import UserSettings from './components/user/UserSettings';
import Billing from './components/billing/Billing';
import GetStarted from './components/get_started/GetStarted';
import Events from './components/events/Events.js';
import SingleEvent from './components/events/SingleEvent';
import UserProfile from './components/user/UserProfile';


class App extends Component {
  render() {
    return (
      <div>
      		{this.props.auth.isEmpty? (
      			<Switch>
      				<Route exact path='/' component={Auth}/>
      				<Route component={NotAuth}/>
      			</Switch>
      		) : 
      		<div>
      			<Switch>							
		      		<Route exact path = '/' component={LandingPage} />
		      		<Route exact path = '/events' component={Events} />
							<Route exact path = '/auth' component = {Auth} />
							<Route exact path = '/user-settings' component = {UserSettings} />
							<Route exact path = '/billing' component = {Billing} />
							<Route exact path = '/get-started' component = {GetStarted} />
							<Route exact path = '/single-event' component = {SingleEvent} />
							<Route exact path = '/user-profile' component = {UserProfile} />				
		      		<Route component={NoPage}/>
		      	</Switch>
	      	</div>
      	}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
	return {auth: state.firebase.auth}
}

export default connect(mapStateToProps, null)(withRouter(App));
