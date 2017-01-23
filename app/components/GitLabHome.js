import React from 'react';
import Reflux from 'reflux';
import { Link } from 'react-router';
import GitLabMasterForm from './GitLabMasterForm';
import { MasterNodeStore, MasterNodeActions } from '../stores/MasterNode';
import { SlaveNodeStore, SlaveNodeActions } from '../stores/SlaveNode';

export default class GitLabHome extends Reflux.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.mapStoreToState(MasterNodeStore, (fromStore) => {
      var object = {};
      object.masterNode = {
        status: fromStore.status,
        options: fromStore.options
      }
      return object;
    });
    this.mapStoreToState(SlaveNodeStore, (fromStore) => {
      return {
        'slaveNode': {
          status: fromStore.status,
          options: fromStore.options
        }
      }
    });
  }

  componentWillMount() {
    MasterNodeActions.fetchData();
    SlaveNodeActions.fetchData();
    super.componentWillMount();
  }

  render() {
    var masterActions = (<div></div>)
    console.log(this.state.masterNode.status);
    if (this.state.masterNode.status === 'STOPPED') {
      masterActions = (
        <div className="row">
          <div className="col-xs-7 col-xs-offset-5">
            <button className="btn btn-default" onClick={MasterNodeActions.start}>
              Start
            </button>
            <button className="btn btn-default" onClick={MasterNodeActions.destroy}>
              Destroy
            </button>
          </div>
        </div>
      )
    } else if (this.state.masterNode.status === 'RUNNING' || this.state.masterNode.status === 'PENDING') {
      masterActions = (<div className="row">
        <div className="col-xs-7 col-xs-offset-5">
          <button className="btn btn-default" onClick={MasterNodeActions.stop}>
            Stop
          </button>
          <a href={`http://${this.state.masterNode.options.ip}:${this.state.masterNode.options.gitlabPort}`} target="_blank" className="btn btn-default">
            Visit GitLab
          </a>
        </div>
      </div>)
    }

    return (
      <div className="container">
        <h1>GitLabHome</h1>
        <div className="row">
          <div className="col-sm-6">
            <h2>Master node</h2>
            <h4>Status: {this.state.masterNode.status}</h4>
            <GitLabMasterForm masterNode={this.state.masterNode} />
            {masterActions}
          </div>
          <div className="col-sm-6">
            <h2>Slave node</h2>
          </div>
        </div>
      </div>
    );
  }
}
