import unirest from 'unirest';
import express from 'express';
import request from 'request';
import cheerio from 'cheerio';
import { generateTemplate, DOCKER_COMPOSE_FILE, execTask } from './index';
import storage from 'electron-json-storage';

export default class MasterNode {
  constructor(status, options) {
    this.status = status;
    this.options = {}
    this.setOptions(options);
    if (this.status === 'RUNNING') {
      this.startHelper();
    }
  }

  setOptions(options) {
    console.log(options);
    this.options = {
      gitlabPort: options.gitlabPort || 80,
      helperPort: options.helperPort || 30000,
      ip: options.ip || '0.0.0.0',
      rootPassword: options.rootPassword || '5iveL!fe'
    }
    storage.set('gitlab-master-options', this.options);
  }

  setStatus(status) {
    this.status = status;
    storage.set('gitlab-master-status', this.status);
  }

  start() {
    return new Promise((resolve, reject) => {
      generateTemplate(this.options).then(() => {
        return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} up -d gitlab`);
      }).then((stdout) => {
        this.setStatus('STARTING');
        this.startHelper();
        resolve(stdout);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      generateTemplate(this.options).then(() => {
        return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} stop gitlab`);
      }).then((stdout) => {
        this.setStatus('STOPPED');
        resolve(stdout);
      }).catch((err) => {
        reject(err)
      });
    });
  }

  destroy() {
    return new Promise((resolve, reject) => {
      generateTemplate(this.options).then(() => {
        return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} down -v gitlab`);
      }).then((stdout) => {
        this.setStatus('NOT STARTED');
        resolve(stdout);
      }).catch((err) => {
        reject(err)
      });
    });
  }

  getLoginPage() {
    return new Promise((resolve, reject) => {
      request.get(`http://${this.options.ip}:${this.options.gitlabPort}/users/sign_in`, (err, response, body) => {
        var cookies = response.headers['set-cookie'][0];
        var $ = cheerio.load(body);
        var authenticityToken = $('form[action*="/users/sign_in"] input[name="authenticity_token"]').val();
        resolve({
          cookies: cookies,
          authenticityToken: authenticityToken
        });
      });
    });
  }

  login(cookies, authenticityToken) {
    return new Promise((resolve, reject) => {
      request.post({
        url: `http://${this.options.ip}:${this.options.gitlabPort}/users/sign_in`,
        headers: {
          'Cookie': cookies,
        },
        form : {
          'authenticity_token': authenticityToken,
          'user[login]': 'root',
          'user[password]': this.options.rootPassword,
          'user[remember_me]': '0',
          'uft8': '✓',
        }
      }, (err, response, body) => {
        resolve(response.headers['set-cookie']);
      });
    });
  }

  queryRegistrationToken(cookies) {
    return new Promise((resolve, reject) => {
      request.get({
        url: `http://${this.options.ip}:${this.options.gitlabPort}/admin/runners`,
        headers: {
          'Cookie': cookies,
        }
      }, (err, response, body) => {
        var $ = cheerio.load(body);
        var registrationToken = $('#runners-token').html();
        resolve(registrationToken);
      });
    });
  }

  getRegistrationToken() {
    return this.getLoginPage().then(result => {
      return this.login(result.cookies, result.authenticityToken)
    }).then(cookies => {
      return this.queryRegistrationToken(cookies)
    });
  }

  startHelper() {
    var app = express();

    app.get('/token', (req, res) => {
      if (this.status === 'RUNNING') {
        this.getRegistrationToken().then(registrationToken => {
          return res.status(200).send(registrationToken);
        });
      } else {
        return res.status(503).send('GitLab is not ready yet');
      }
    });

    return app.listen(this.options.helperPort, this.options.ip, () => {
      console.log(`Application started at http://${this.options.ip}:${this.options.helperPort}`);
    });
  }

  checkStatus() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://0.0.0.0:${this.options.gitlabPort}`)
      .timeout(5000)
      .end((response) => {
        if (response.status === 200) {
          this.setStatus('RUNNING');
        }
        resolve(this.status);
      });
    });
  }
}
