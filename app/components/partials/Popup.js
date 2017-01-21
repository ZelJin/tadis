import React, { Component } from 'react';

export default class Popup extends Component {
  props: {
    id: String,
    title: String,
    message: String,
  }

  render() {
    return (
      <div className="modal fade" tabIndex="-1" role="dialog">
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
