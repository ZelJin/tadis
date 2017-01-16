// @flow
import React, { Component } from 'react';
import Breadcrumbs from 'react-breadcrumbs'
import MasterNode from '../plugins/gitlab/MasterNode';
import SlaveNode from '../plugins/gitlab/SlaveNode';
import { GITLAB_DEFAULT_OPTIONS } from '../plugins/gitlab/DefaultOptions';

export default class App extends Component {
  constructor(props) {
    super(props);
    var masterNode = new MasterNode(GITLAB_DEFAULT_OPTIONS);
    var slaveNode = new SlaveNode(GITLAB_DEFAULT_OPTIONS);
    this.state = {
      masterNode: masterNode,
      slaveNode: slaveNode,
    }
  }

  props: {
    children: HTMLElement,
    routes: Object,
    params: Object
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params}
          wrapperElement="ol" itemElement="li" wrapperClass="breadcrumb" separator="" />
        {React.cloneElement(this.props.children, {
          masterNode: this.state.masterNode,
          slaveNode: this.state.slaveNode
        })}
      </div>
    );
  }
}
