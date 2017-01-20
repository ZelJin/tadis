// @flow
import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';


export default class CreateGitLabSlave extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ip: this.props.slaveNode.options.ip,
      gitlabPort: this.props.slaveNode.options.gitlabPort,
      masterIp: this.props.slaveNode.options.masterIp
    }
  }

  props: {
    slaveNode: Object
  }

  onIpChange(event) {
    this.setState({ip: event.target.value})
  }

  onGitlabPortChange(event) {
    this.setState({gitlabPort: event.target.value});
  }

  onMasterIpChange(event) {
    this.setState({masterIp: event.target.value});
  }

  createSlaveNode() {
    this.props.slaveNode.updateOptions(this.state);
    this.props.slaveNode.start().then(() => {
      hashHistory.push('/gitlab');
    });
  }

  render() {
    return (
      <div className="container">
        <h1>CreateGitLabSlave</h1>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="masterIp" className="col-xs-3 control-label">
              Gitlab IP address
            </label>
            <div className="col-xs-9">
              <input id="masterIp" type="text" className="form-control"
                value={this.state.masterIp} onChange={this.onMasterIpChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="gitlabPort" className="col-xs-3 control-label">
              Gitlab Port
            </label>
            <div className="col-xs-9">
              <input id="gitlabPort" type="text" className="form-control"
                value={this.state.gitlabPort} onChange={this.onGitlabPortChange.bind(this)}/>
            </div>
          </div>
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
            <div className="col-xs-9 col-xs-offset-3">
              <button type="submit" className="btn btn-default"
                 onClick={this.createSlaveNode.bind(this)} >Create node</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
