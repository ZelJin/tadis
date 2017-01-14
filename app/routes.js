// @flow
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import HomePage from './components/HomePage';
import GitLabHome from './components/GitLabHome';
import GitLabMaster from './components/GitLabMaster';
import GitLabSlave from './components/GitLabSlave';


export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="/gitlab">
      <IndexRoute component={GitLabHome} />
      <Route path="/master" component={GitLabMaster} />
      <Route path="/slave" component={GitLabSlave} />
    </Route>
  </Route>
);
