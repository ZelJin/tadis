import React, { Component } from 'react';

export default class Flash extends Component {
  props: {
    flash: Object
  }

  render() {
    var className = "alert alert-fixed alert-" + this.props.flash.type;
    return (
      <div className={className} role="alert">
        <button type="button" className="close" onClick={this.props.flash.hide} aria-label="close">
          <span aria-hidden="true">&times;</span>
        </button>
        <p>{this.props.flash.message.toString()}</p>
      </div>
    )
  }
}
