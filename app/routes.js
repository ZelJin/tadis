// @flow
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import HomePage from './components/HomePage';
import GitLabHome from './components/GitLabHome';

export default (
  <Route name="Home" path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route name="GitLab CI" path="gitlab">
      <IndexRoute component={GitLabHome} />
    </Route>
  </Route>
);
