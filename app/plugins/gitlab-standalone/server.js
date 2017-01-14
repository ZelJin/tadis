var express = require('express');
var app = express();
var masterNode = require('./master');
var Nightmare = require('nightmare');
var unirest = require('unirest');
var yaml = require('yaml');
var fs = require('fs');

var manifest = yaml.eval(fs.readFileSync('manifest.yml', 'utf8'));

function statusCheck() {
  return new Promise((resolve, reject) => {
    unirest.get(`http://${manifest.env.IP_ADDRESS}:${manifest.env.PORT}`)
    .timeout(5000)
    .end((response) => {
      resolve(response.status === 200 ? 'RUNNING' : 'STOPPED')
    });
  });
}


function waitForRunning() {
  console.log('waiting');
  return new Promise((resolve, reject) => {
    statusCheck().then((status) => {
      if (status === 'RUNNING') {
        console.log('running');
        resolve()
      } else {
        setTimeout(() => {
          waitForRunning()
        }, 5000);
      }
    });
  });
}

function getRegistrationToken() {
  return new Promise((resolve, reject) => {
    const nightmare = new Nightmare();
    nightmare.goto(`http://${manifest.env.IP_ADDRESS}:${manifest.env.PORT}/users/sign_in`)
    .wait('form[action*="/users/sign_in"]')
    .type('form[action*="/users/sign_in"] [name="user[login]"]', 'root')
    .type('form[action*="/users/sign_in"] [name="user[password]"]', manifest.env.DEFAULT_PASSWORD)
    .click('form[action*="/users/sign_in"] [type=submit]')
    .wait('.blank-state-welcome-title')
    .goto(`http://${manifest.env.IP_ADDRESS}:${manifest.env.PORT}/admin/runners`)
    .wait('#runners-token')
    .evaluate(() => {
      console.log(document.querySelector('#runners-token').innerText);
      return document.querySelector('#runners-token').innerText;
    })
    .end()
    .then((result) => {
      console.log(result);
      resolve(result);
    });
  });
}

app.get('/token', (req, res) => {
  waitForRunning().then(() => {
    return getRegistrationToken()
  }).then((token) => {
    console.log(token);
    res.status(200).send(token);
  }).catch((err) => {
    console.error(err);
  });
});

var server = app.listen(3000, manifest.env.IP_ADDRESS, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Application started at http://%s:%s", host, port);
});
