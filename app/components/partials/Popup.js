import React, { Component } from 'react';

export default class Popup extends Component {
  props: {
    title: String,
    message: String,
    status: String,
    selector: String
  }

  componentWillReceiveProps(newProps) {
    if (newProps.status === 'PENDING' && this.props.status !== 'PENDING') {
      $('#' + newProps.selector).modal('show');
    }
    if (newProps.status !== 'PENDING' && this.props.status === 'PENDING') {
      $('#' + newProps.selector).modal('hide');
    }
  }

  render() {
    return (
      <div id={this.props.selector} className="modal fade" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{this.props.title}</h4>
            </div>
            <div className="modal-body">
              <p>{this.props.message}</p>
              <div className="center-block">
                <i className="fa fa-circle-o-notch fa-spin fa-3x"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
