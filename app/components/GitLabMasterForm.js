// @flow
import React, { Component } from 'react';
import Popup from './partials/Popup';
import { MasterNodeActions } from '../stores/MasterNode';
import ip from 'ip';


export default class GitLabMasterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ip: this.props.masterNode.status === 'NOT STARTED' ? ip.address() : this.props.masterNode.options.ip,
      gitlabPort: this.props.masterNode.options.gitlabPort,
      rootPassword: this.props.masterNode.options.rootPassword
    }
  }

  props: {
    masterNode: Object,
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

  render() {
    var allowCreate = this.props.masterNode.status === 'NOT STARTED';
    return (
      <div>
        <form className="form-horizontal">
          <div className="form-group">
            <label htmlFor="ip" className="col-xs-5 control-label">
              IP address
            </label>
            <div className="col-xs-7">
              <input id="ip" type="text" className="form-control" disabled={!allowCreate}
                value={this.state.ip} onChange={this.onIpChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="gitlabPort" className="col-xs-5 control-label">
              Port
            </label>
            <div className="col-xs-7">
              <input id="gitlabPort" type="text" className="form-control"  disabled={!allowCreate} value={this.state.gitlabPort} onChange={this.onGitlabPortChange.bind(this)}/>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="rootPassword" className="col-xs-5 control-label">
              Root password
            </label>
            <div className="col-xs-7">
              <input id="rootPassword" type="text" className="form-control"
                value={this.state.rootPassword} disabled={!allowCreate} onChange={this.onRootPasswordChange.bind(this)}/>
            </div>
          </div>
          {allowCreate ? (
            <div className="form-group">
              <div className="col-xs-7 col-xs-offset-5">
                <button type="submit" className="btn btn-default"
                   onClick={() => {MasterNodeActions.create({
                     ip: this.state.ip,
                     gitlabPort: this.state.gitlabPort,
                     rootPassword: this.state.rootPassword
                   })}}>
                   Create node
                 </button>
              </div>
            </div>
          ): null}
        </form>
        <Popup selector={'gitlab-master-popup'} status={this.props.masterNode.status}
          title='Creating master node' message =
          'Master node is being created. This may take a while.'/>
      </div>
    );
  }
}
