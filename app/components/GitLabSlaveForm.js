// @flow
import React, { Component } from 'react';
import Popup from './partials/Popup';
import { SlaveNodeActions } from '../stores/SlaveNode';
import ip from 'ip';


export default class GitLabSlaveForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      masterIp: this.props.slaveNode.options.masterIp,
      gitlabPort: this.props.slaveNode.options.gitlabPort,
    }
  }

  props: {
    slaveNode: Object,
  }

  onGitlabPortChange(event) {
    this.setState({gitlabPort: event.target.value});
  }

  onMasterIpChange(event) {
    this.setState({masterIp: event.target.value});
  }

  render() {
    var allowCreate = this.props.slaveNode.status === 'NOT STARTED';
    return (
      <div>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="masterIp" className="col-xs-5 control-label">
              Master IP
            </label>
            <div className="col-xs-7">
              <input id="masterIp" type="text" className="form-control" disabled={!allowCreate}
                value={this.state.masterIp} onChange={this.onMasterIpChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="gitlabPort" className="col-xs-5 control-label">
              Master Port
            </label>
            <div className="col-xs-7">
              <input id="gitlabPort" type="text" className="form-control" disabled={!allowCreate}
                value={this.state.gitlabPort} onChange={this.onGitlabPortChange.bind(this)}/>
            </div>
          </div>
          {allowCreate ? (
            <div className="form-group">
              <div className="col-xs-7 col-xs-offset-5">
                <button type="submit" className="btn btn-default"
                   onClick={() => {SlaveNodeActions.create({
                     masterIp: this.state.masterIp,
                     rootPassword: this.state.rootPassword
                   })}}>
                   Connect to master node
                 </button>
              </div>
            </div>
          ): null}
        </form>
        <Popup selector={'gitlab-slave-popup'} status={this.props.slaveNode.status} title='Creating slave node' message = 'Slave node is being created. This may take a while.'/>
      </div>
    );
  }
}
