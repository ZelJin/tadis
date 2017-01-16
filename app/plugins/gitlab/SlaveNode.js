import { execSync } from 'child_process';
import unirest from 'unirest';
import fs from 'fs';
import replaceStream from 'replacestream';

export default class SlaveNode {
  constructor(options) {
    this.status = 'STOPPED';
    this.updateOptions(options);
  }

  prepareTemplate() {
    return new new Promise(function(resolve, reject) {
      const reader = fs.createReadStream('docker-cmpose-template.yml');
      const writer = fs.createWriteStream('docker-compose.yml');
      wr.on('close', resolve);
      for (key in this.options) {
        reader = reader.pipe(replaceStream('${' + key + '}', this.options[key]));
      }
      reader.pipe(writer);
    });
  }

  updateOptions(options) {
    this.options = {
      gitlabPort: options.gitlabPort || 80,
      helperPort: options.helperPort || 30000,
      ip: options.ip || '0.0.0.0',
      masterIp: options.masterIp || '0.0.0.0'
    }
  }

  getRegistrationToken() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://${this.options.ip}:${this.options.helperPort}/token`)
      .end((response) => {
        console.log(response.body);
        resolve(response.body);
      });
    });
  }

  connectToMaster(registrationToken) {
    return new Promise((resolve, reject) => {
      execSync(`docker exec gitlab-runner gitlab-runner register --non-interactive --url http://${this.options.ip}:${this.options.gitlabPort} --registration-token ${registrationToken} --executor "docker" --name "docker-runner" --docker-image "ubuntu:latest"`)
    });
  }

  start() {
    return this.prepareTemplate().then(() => {
      execSync('docker-compose up -d gitlab-runner');
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
