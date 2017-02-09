import Reflux from 'reflux';

export const NotificationActions = Reflux.createActions([
  'add',
  'remove',
  'clear'
]);

export class NotificationStore extends Reflux.Store {
  constructor() {
    super();
    this.state = {
      notifications: []
    }
    this.listenables = NotificationActions;
  }

  onAdd(type, message) {
    this.state.notifications.push({
      type: type,
      message: message,
    });
    this.setState({
      notifications: this.state.notifications,
    });
  }

  onRemove(index) {
    this.state.notifications.splice(index, 1);
    this.setState({
      notifications: this.state.notifications,
    });
  }

  onClear() {
    this.setState({
      notifications: []
    });
  }
}
