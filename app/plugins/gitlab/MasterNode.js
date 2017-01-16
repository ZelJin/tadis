import { execSync } from 'child_process';
import unirest from 'unirest';
import fs from 'fs';
import replaceStream from 'replacestream';
import express from 'express';
import request from 'request';
import cheerio from 'cheerio';

export default class MasterNode {
  constructor(options) {
    this.status = 'STOPPED';
    this.options = {}
    this.updateOptions(options);
  }

  prepareTemplate() {
    return new Promise(function(resolve, reject) {
      const reader = fs.createReadStream('./docker-compose-template.yml');
      const writer = fs.createWriteStream('./docker-compose.yml');
      writer.on('close', resolve);
      console.log(this);
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
      rootPassword: options.rootPassword || '5iveL!fe'
    }
  }

  start() {
    this.prepareTemplate.bind(this).then(() => {
      execSync('docker-compose up -d gitlab');
      this.status = 'STARTING';
      this.startHelper.bind(this);
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
    return getLoginPage().then(result => {
      return login(result.cookies, result.authenticityToken)
    }).then(cookies => {
      return queryRegistrationToken(cookies)
    });
  }

  startHelper() {
    var app = express();

    app.get('/token', (req, res) => {
      if (this.status === 'RUNNING') {
        this.getRegistrationToken().then(result => {
          console.log(token);
          return res.status(200).send(token);
        });
      } else {
        return res.status(503).send('GitLab is not ready yet');
      }
    });

    return app.listen(this.options.helperPort, this.options.ip, () => {
      var host = server.address().address;
      var port = server.address().port;
      console.log("Application started at http://%s:%s", host, port);
    });
  }

  checkStatus() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://0.0.0.0:${this.options.gitlabPort}`)
      .timeout(5000)
      .end((response) => {
        console.log(response.status);
        if (response.status === 200) {
          this.status = 'RUNNING';
        }
        resolve(this.status);
      });
    });
  }
}
