// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';


export default class GitLabHome extends Component {
  render() {
    return (
      <div className="container">
        <h1>GitLabHome</h1>
        <div className="row">
          <div className="col-sm-6">
            <h2><Link to="gitlab/master">Master node details</Link></h2>
            <h4>Actions:</h4>
            <Link className="btn btn-default" to="gitlab/master/create">Create</Link>
          </div>
          <div className="col-sm-6">
            <h2><Link to="gitlab/slave">Slave node details</Link></h2>
            <h4>Actions:</h4>
            <Link className="btn btn-default" to="gitlab/slave/create">Create</Link>
          </div>
        </div>
      </div>
    );
  }
}
