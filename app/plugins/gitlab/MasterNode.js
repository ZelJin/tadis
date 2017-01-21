import unirest from 'unirest';
import express from 'express';
import request from 'request';
import cheerio from 'cheerio';
import { generateTemplate, DOCKER_COMPOSE_FILE, execTask } from './index';

export default class MasterNode {
  constructor(options) {
    this.status = 'STOPPED';
    this.options = {}
    this.updateOptions(options);
  }

  updateOptions(options) {
    this.options = {
      gitlabPort: options.gitlabPort || 80,
      helperPort: options.helperPort || 30000,
      ip: options.ip || '0.0.0.0',
      rootPassword: options.rootPassword || '5iveL!fe'
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      generateTemplate(this.options).then(() => {
        return execTask(`docker-compose -f ${DOCKER_COMPOSE_FILE} up -d gitlab`);
      }).then((stdout) => {
        this.status = 'STARTING';
        this.startHelper();
        resolve(stdout);
      }).catch((err) => {
        reject(err);
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
          this.status = 'RUNNING';
        }
        resolve(this.status);
      });
    });
  }
}
