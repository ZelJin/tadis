import Reflux from 'reflux';
import unirest from 'unirest';
import { DEFAULT_OPTIONS, generateTemplate, execTask } from '../helpers/gitlab';
import { NotificationActions } from './Notifications';
import storage from 'electron-json-storage';

export const SlaveNodeActions = Reflux.createActions([
  'fetchData',
  'create',
  'destroy',
]);

const DOCKER_COMPOSE_FILE = process.resourcesPath + '/gitlab-slave.yml';

export class SlaveNodeStore extends Reflux.Store {
  constructor() {
    super();
    this.state = {
      status: 'NOT STARTED',
      options: DEFAULT_OPTIONS
    }
    this.listenables = SlaveNodeActions;
  }

  // public methods

  onFetchData() {
    storage.getAll((error, data) => {
      if (data && data.hasOwnProperty('gitlab-slave-options') &&
        data.hasOwnProperty('gitlab-slave-status')) {
        this.setState({
          status: data['gitlab-slave-status'],
          options: data['gitlab-slave-options']
        });
      }
    });
  }

  onCreate() {
    const prevStatus = this.state.status;
    this.setStatus('PENDING');
    this.setOptions(newOptions);
    generateTemplate(DOCKER_COMPOSE_FILE, this.state.options, 'gitlab-runner').then(() => {
      return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} up -d`)
    }).then((stdout) => {
      console.log(stdout);
      return this.getRegistrationToken()
    }).then((registrationToken) => {
      return this.connectToMaster(registrationToken);
    }).then((stdout) => {
      this.setStatus('RUNNING');
      console.log(stdout);
      NotificationActions.add('success', 'Successfully started slave node.');
    }).catch((err) => {
      this.setStatus(prevStatus);
      NotificationActions.add('danger', err);
    });
  }

  onDestroy() {
    const prevStatus = this.state.status;
    this.setStatus('PENDING');
    generateTemplate(DOCKER_COMPOSE_FILE, this.state.options, 'gitlab-runner').then(() => {
      return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} down -v`)
    }).then((stdout) => {
      this.setStatus('NOT STARTED');
      console.log(stdout);
      NotificationActions.add('success', 'Successfully destroyed slave node.');
    }).catch((err) => {
      this.setStatus(prevStatus);
      NotificationActions.add('danger', err);
    });
  }

  //private methods

  setOptions(newOptions) {
    storage.set('gitlab-slave-options', newOptions);
    this.setState({
      options: {
        gitlabPort: newOptions.gitlabPort || DEFAULT_OPTIONS.gitlabPort,
        helperPort: newOptions.helperPort || DEFAULT_OPTIONS.helperPort,
        masterIp: newOptions.masterIp || DEFAULT_OPTIONS.masterIp
      },
      status: this.state.status
    });
  }

  setStatus(newStatus) {
    storage.set('gitlab-slave-status', newStatus);
    this.setState({
      options: this.state.options,
      status: newStatus,
    });
  }

  getRegistrationToken() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://${this.state.options.masterIp}:${this.state.options.helperPort}/token`)
      .end((response) => {
        console.log(response.body);
        resolve(response.body);
      });
    });
  }

  connectToMaster(registrationToken) {
    return execTask(`docker exec gitlab-runner gitlab-runner register --non-interactive --url http://${this.state.options.masterIp}:${this.state.options.gitlabPort} --registration-token ${registrationToken} --executor "docker" --name "docker-runner" --docker-image "ubuntu:latest"`)
  }
}
