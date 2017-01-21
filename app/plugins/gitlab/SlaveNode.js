import unirest from 'unirest';
import { generateTemplate, DOCKER_COMPOSE_FILE, execTask } from './index';

export default class SlaveNode {
  constructor(options) {
    this.status = 'STOPPED';
    this.updateOptions(options);
  }

  updateOptions(options) {
    this.options = {
      gitlabPort: options.gitlabPort || 80,
      helperPort: options.helperPort || 30000,
      masterIp: options.masterIp || '0.0.0.0'
    }
  }

  getRegistrationToken() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://${this.options.masterIp}:${this.options.helperPort}/token`)
      .end((response) => {
        console.log(response.body);
        resolve(response.body);
      });
    });
  }

  connectToMaster(registrationToken) {
    return execTask(`docker exec gitlab-runner gitlab-runner register --non-interactive --url http://${this.options.masterIp}:${this.options.gitlabPort} --registration-token ${registrationToken} --executor "docker" --name "docker-runner" --docker-image "ubuntu:latest"`)
  }

  start() {
    return generateTemplate(this.options).then(() => {
      return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} up -d gitlab-runner`);
    }).then(() => {
      return this.getRegistrationToken()
    }).then((registrationToken) => {
      return this.connectToMaster(registrationToken);
    });
  }

  checkStatus() {
    return this.status;
  }
}
