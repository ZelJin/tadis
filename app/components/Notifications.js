import React from 'react';
import Reflux from 'reflux';
import { NotificationActions, NotificationStore } from '../stores/Notifications';

export default class Notifications extends Reflux.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.store = NotificationStore;
  }

  render() {
    return (
      <div className="alert-container">
        {this.state.notifications.map((notification, index) => {
          var className = "alert alert-" + notification.type;
          return (
            <div className={className} role="alert" key={index}>
              <button type="button" className="close" onClick={() => {NotificationActions.remove(index)}} aria-label="close">
                <span aria-hidden="true">&times;</span>
              </button>
              <p>{notification.message.toString()}</p>
            </div>
          )
        })}
      </div>
    )
  }
}
