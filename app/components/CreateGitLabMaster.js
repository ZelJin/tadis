// @flow
import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';


export default class CreateGitLabMaster extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ip: this.props.masterNode.options.ip,
      gitlabPort: this.props.masterNode.options.gitlabPort,
      rootPassword: this.props.masterNode.options.rootPassword
    }
  }

  props: {
    masterNode: Object
  }

  onIpChange(event) {
    this.setState({ip: event.target.value})
  }

  onGitlabPortChange(event) {
    this.setState({gitlabPort: event.target.value});
  }

  onRootPasswordChange(event) {
    this.setState({rootPassword: event.target.value});
  }

  createMasterNode() {
    this.props.masterNode.updateOptions(this.state);
    this.props.masterNode.start().then(() => {
      hashHistory.push('/gitlab');
    });
  }

  render() {
    return (
      <div className="container">
        <h1>CreateGitLabMaster</h1>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="ip" className="col-xs-3 control-label">
              IP address
            </label>
            <div className="col-xs-9">
              <input id="ip" type="text" className="form-control"
                value={this.state.ip} onChange={this.onIpChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="gitlabPort" className="col-xs-3 control-label">
              Port
            </label>
            <div className="col-xs-9">
              <input id="gitlabPort" type="text" className="form-control"
                value={this.state.gitlabPort} onChange={this.onGitlabPortChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="rootPassword" className="col-xs-3 control-label">
              Root password
            </label>
            <div className="col-xs-9">
              <input id="rootPassword" type="password" className="form-control"
                value={this.state.rootPassword} onChange={this.onRootPasswordChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <div className="col-xs-9 col-xs-offset-3">
              <button type="submit" className="btn btn-default"
                 onClick={this.createMasterNode.bind(this)} >Create node</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
