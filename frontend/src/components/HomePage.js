import React, { Component } from "react";
import DriverPredictions from "./DriverPredictions";
import TeamPredictions from "./TeamPredictions";
import MidfieldPredictions from "./MidfieldPredictions";
import F1HomePage from "./F1HomePage";
import Sidebar from './Sidebar';
import PaddockCreate from './CreatePaddock';
import PaddockJoin from './JoinPaddock';
import Leaderboard from './Leaderboard';
import MyLeaderboards from './MyLeaderboards';
import MyPaddocks from './MyPaddocks';
import midSeasonDriverPredictions from './midSeasonDriverPredictions';
import MidSeasonTeamPrediction from './MidSeasonTeamPrediction';
import PaddockRules from './PaddockRules';
import MyConstructorPredictions from './MyConstructorPredictions';
import ManualResultCapture from './ManualResultCapture';
import MySeasonDriverPredictions from './mySeasonDriverPredictions';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { baseUrl } from './F1HomePage'
import Modal from './Modal'
import { generatePath } from "react-router"

export default class HomePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Sidebar/>
        <Switch>
          <Route exact path="/" component={F1HomePage}></Route>
          <Route path='/api/logout' component={() => { 
            window.location.href = baseUrl + '/api/logout'; 
            return null;
            }}/>
          <Route path="/driver-predictions/:id" component={DriverPredictions} />
          <Route path="/F1HomePage" component={F1HomePage} />
          <Route path="/team-predictions/:id" component={TeamPredictions} />
          <Route path="/midfield-predictions" component={MidfieldPredictions} />
          <Route path="/create-paddock" component={PaddockCreate} />
          <Route path="/join-paddock" component={PaddockJoin} />
          <Route path="/my-paddocks" component={MyPaddocks} />
          <Route path="/mid-season-driver-predictions" component={midSeasonDriverPredictions} />
          <Route path="/mid-season-team-predictions" component={MidSeasonTeamPrediction} />
          <Route path="/my-paddocks" component={MyPaddocks} />
          <Route path="/paddock-rules/:id" component={PaddockRules} />
          <Route path="/leaderboards/:id" component={Leaderboard} />
          <Route path="/my-leaderboards/" component={MyLeaderboards} />
          <Route path="/my-constructor-predictions" component={MyConstructorPredictions} />
          <Route path="/manual-result-capture/:id" component={ManualResultCapture} />
          <Route path="/my-driver-standing=predictions" component={MySeasonDriverPredictions} />

        </Switch>
      </Router>
    );
  }
}