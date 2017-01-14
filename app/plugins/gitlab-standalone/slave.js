const yaml = require('yaml');
const exec = require('child_process').execSync;
const unirest = require('unirest');
const fs = require('fs');
const replaceStream = require('replacestream');
const Nightmare = require('nightmare');

function prepareTemplate(manifest) {
  return new Promise(function(resolve, reject) {
    // Parse manifest.yaml to grab env variables
    var rd = fs.createReadStream('template.yml');
    var wr = fs.createWriteStream('docker-compose.yml');
    wr.on('close', resolve);
    for (key in manifest.env) {
      rd = rd.pipe(replaceStream('${' + key + '}', manifest.env[key]));
    }
    rd.pipe(wr);
  });
}

module.exports = {
  manifest: yaml.eval(fs.readFileSync('manifest.yml', 'utf8')),
  start: function() {
    return new Promise((resolve, reject) => {
      prepareTemplate(this.manifest).then(() => {
        exec('docker-compose up -d gitlab-runner');
        resolve();
      });
    });
  },

  getRegistrationToken: function() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://${this.manifest.env.MASTER_IP_ADDRESS}:3000/token`)
      .end((response) => {
        console.log(response.body);
        resolve(response.body);
      });
    });
  },

  connectToMaster: function(registrationToken) {
    return new Promise((resolve, reject) => {
      exec(`docker exec gitlab-runner gitlab-runner register --non-interactive --url http://${this.manifest.env.MASTER_IP_ADDRESS}:${this.manifest.env.PORT} --registration-token ${registrationToken} --executor "shell" --name "shell-runner"`)
      exec(`docker exec gitlab-runner gitlab-runner register --non-interactive --url http://${this.manifest.env.MASTER_IP_ADDRESS}:${this.manifest.env.PORT} --registration-token ${registrationToken} --executor "docker" --name "docker-runner" --docker-image "ubuntu:latest"`)
    });
  },
}
