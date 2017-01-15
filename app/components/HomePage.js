// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Home extends Component {
  render() {
    return (
      <div>
        <div className="container">
          <h1>Select CI you'd like to install:</h1>
          <ul>
            <li><h2><Link to="gitlab">GitLab</Link></h2></li>
          </ul>
        </div>
      </div>
    );
  }
}
