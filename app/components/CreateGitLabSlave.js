// @flow
import React, { Component } from 'react';
import { Link, hashHistory } from 'react-router';
import Popup from './partials/Popup';


export default class CreateGitLabSlave extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gitlabPort: this.props.slaveNode.options.gitlabPort,
      masterIp: this.props.slaveNode.options.masterIp
    }
  }

  props: {
    slaveNode: Object,
    flash: Object
  }

  onGitlabPortChange(event) {
    this.setState({gitlabPort: event.target.value});
  }

  onMasterIpChange(event) {
    this.setState({masterIp: event.target.value});
  }

  createSlaveNode(event) {
    event.preventDefault();
    this.props.slaveNode.updateOptions(this.state);
    $('.modal.fade').modal('show');
    this.props.slaveNode.start().then(() => {
      $('.modal.fade').modal('hide');
      this.props.flash.show('success', 'Successfully created slave node.');
      setTimeout(() => {
        hashHistory.push('/gitlab');
      }, 300);
    }).catch((err) => {
      $('.modal.fade').modal('hide')
      setTimeout(() => {
        this.props.flash.show('danger', err);
        hashHistory.push('/gitlab');
      }, 300);
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
            <div className="col-xs-9 col-xs-offset-3">
              <button type="submit" className="btn btn-default"
                 onClick={this.createSlaveNode.bind(this)} >Create node</button>
            </div>
          </div>
        </form>
        <Popup stitle='Creating slave node' message = 'Slave node is being created. This may take a while.'/>
      </div>
    );
  }
}
