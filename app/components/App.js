// @flow
import React, { Component } from 'react';
import Breadcrumbs from 'react-breadcrumbs'

export default class App extends Component {
  props: {
    children: HTMLElement,
    routes: Object,
    params: Object
  };

  render() {
    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params}
          wrapperElement="ol" itemElement="li" wrapperClass="breadcrumb" separator="" />
        {this.props.children}
      </div>
    );
  }
}
