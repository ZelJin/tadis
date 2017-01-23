import Reflux from 'reflux';
import unirest from 'unirest';
import { DEFAULT_OPTIONS, generateTemplate, execTask } from '../helpers/gitlab';
import { startHelper, stopHelper } from '../helpers/GitLabSatellite';
import { NotificationActions } from './Notifications';
import storage from 'electron-json-storage';

export const MasterNodeActions = Reflux.createActions([
  'fetchData',
  'start',
  'stop',
  'create',
  'destroy',
]);

const DOCKER_COMPOSE_FILE = process.resourcesPath + '/gitlab-master.yml';

export class MasterNodeStore extends Reflux.Store {
  constructor() {
    super();
    this.state = {
      status: 'NOT STARTED',
      options: DEFAULT_OPTIONS
    }
    this.listenables = MasterNodeActions;
  }

  // public methods, defined in actions

  onFetchData() {
    storage.getAll((error, data) => {
      if (data && data.hasOwnProperty('gitlab-master-options') && data.hasOwnProperty('gitlab-master-status')) {
        this.setState({
          status: data['gitlab-master-status'],
          options: {
            gitlabPort:   data['gitlab-master-options'].gitlabPort || DEFAULT_OPTIONS.gitlabPort,
            helperPort:   data['gitlab-master-options'].helperPort || DEFAULT_OPTIONS.helperPort,
            rootPassword:   data['gitlab-master-options'].rootPassword || DEFAULT_OPTIONS.rootPassword,
            ip:   data['gitlab-master-options'].ip || DEFAULT_OPTIONS.ip
          }
        });
        if (data['gitlab-master-status'] === 'RUNNING') {
          startHelper(data['gitlab-master-options']);
        }
      }
    });
  }

  onCreate(newOptions) {
    this.setOptions(newOptions);
    this.onStart();
  }

  onStart() {
    const prevStatus = this.state.status;
    this.setStatus('PENDING');
    generateTemplate(DOCKER_COMPOSE_FILE, this.state.options, 'gitlab').then(() => {
      return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} up -d`)
    }).then((stdout) => {
      console.log(stdout);
      return this.waitForRunning();
    }).then(() => {
      console.log('starting helper');
      startHelper(this.state.options);
      NotificationActions.add('success', 'Successfully started master node.');
      this.setStatus('RUNNING');
    }).catch((err) => {
      this.setStatus(prevStatus);
      NotificationActions.add('danger', err);
    });
  }

  onStop() {
    const prevStatus = this.state.status;
    this.setStatus('PENDING');
    generateTemplate(DOCKER_COMPOSE_FILE, this.state.options, 'gitlab').then(() => {
      return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} stop gitlab`)
    }).then((stdout) => {
      console.log(stdout);
      stopHelper();
      NotificationActions.add('success', 'Successfully stopped master node.');
      this.setStatus('STOPPED');
    }).catch((err) => {
      this.setStatus(prevStatus);
      NotificationActions.add('danger', err);
    });
  }

  onDestroy() {
    const prevStatus = this.state.status;
    this.setStatus('PENDING');
    generateTemplate(DOCKER_COMPOSE_FILE, this.state.options, 'gitlab').then(() => {
      return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} down -v`)
    }).then((stdout) => {
      console.log(stdout);
      stopHelper();
      NotificationActions.add('success', 'Successfully destroyed master node.');
      this.setStatus('NOT STARTED');
    }).catch((err) => {
      if (err.toString().includes('Found orphan containers (gitlab-runner) for this project.')) {
        // False positive
        this.setStatus('NOT STARTED');
        NotificationActions.add('success', 'Successfully destroyed master node.');
      } else {
        this.setStatus(prevStatus);
        NotificationActions.add('danger', err);
      }
    });
  }

  // Private methods

  setOptions(newOptions) {
    storage.set('gitlab-master-options', newOptions);
    this.setState({
      options: {
        gitlabPort: newOptions.gitlabPort || DEFAULT_OPTIONS.gitlabPort,
        helperPort: newOptions.helperPort || DEFAULT_OPTIONS.helperPort,
        rootPassword: newOptions.rootPassword || DEFAULT_OPTIONS.rootPassword,
        ip: newOptions.ip || DEFAULT_OPTIONS.ip
      },
      status: this.state.status
    });
  }

  setStatus(newStatus) {
    storage.set('gitlab-master-status', newStatus);
    this.setState({
      options: this.state.options,
      status: newStatus
    });
  }

  checkStatus() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://0.0.0.0:${this.state.options.gitlabPort}`)
      .timeout(5000)
      .end((response) => {
        resolve(response.status);
      });
    });
  }

  waitForRunning() {
    const checkStatus = this.checkStatus.bind(this);
    return new Promise((resolve, reject) => {
      (function waiting() {
        checkStatus().then((status) => {
          if (status === 200) { return resolve(); }
          else { setTimeout(waiting, 5000); }
        });
      })();
    });
  }
}
