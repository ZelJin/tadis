import express from 'express';
import request from 'request';
import cheerio from 'cheerio';

var server = undefined;

export function startHelper(options) {
  const app = express();

  function getLoginPage() {
    return new Promise((resolve, reject) => {
      request.get(`http://${options.ip}:${options.gitlabPort}/users/sign_in`, (err, response, body) => {
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

  function login(cookies, authenticityToken) {
    return new Promise((resolve, reject) => {
      request.post({
        url: `http://${options.ip}:${options.gitlabPort}/users/sign_in`,
        headers: {
          'Cookie': cookies,
        },
        form : {
          'authenticity_token': authenticityToken,
          'user[login]': 'root',
          'user[password]': options.rootPassword,
          'user[remember_me]': '0',
          'uft8': '✓',
        }
      }, (err, response, body) => {
        resolve(response.headers['set-cookie']);
      });
    });
  }

  function queryRegistrationToken(cookies) {
    return new Promise((resolve, reject) => {
      request.get({
        url: `http://${options.ip}:${options.gitlabPort}/admin/runners`,
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

  function getRegistrationToken() {
    return getLoginPage().then(result => {
      return login(result.cookies, result.authenticityToken)
    }).then(cookies => {
      return queryRegistrationToken(cookies)
    });
  }

  app.get('/token', (req, res) => {
    getRegistrationToken().then(registrationToken => {
      return res.status(200).send(registrationToken);
    });
  });

  server = app.listen(options.helperPort, options.ip, () => {
    console.log(`Application started at http://${options.ip}:${options.helperPort}`);
  });
}

export function stopHelper() {
  if (server) {
    server.close();
    server = undefined;
  }
}
