// @flow
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './components/App';
import HomePage from './components/HomePage';
import GitLabHome from './components/GitLabHome';
import GitLabMaster from './components/GitLabMaster';
import GitLabSlave from './components/GitLabSlave';
import CreateGitLabMaster from './components/CreateGitLabMaster';
import CreateGitLabSlave from './components/CreateGitLabSlave';


export default (
  <Route name="CIMagic" path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route name="GitLab CI" path="gitlab">
      <IndexRoute component={GitLabHome} />
      <Route name="Master node" path="master">
        <IndexRoute component={GitLabMaster} />
        <Route name="Create" path="create" component={CreateGitLabMaster} />
      </Route>
      <Route name="Slave node" path="slave">
        <IndexRoute component={GitLabSlave} />
        <Route name="Create" path="create" component={CreateGitLabSlave} />
      </Route>
    </Route>
  </Route>
);
