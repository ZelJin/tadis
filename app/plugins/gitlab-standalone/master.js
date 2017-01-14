const yaml = require('yaml');
const exec = require('child_process').execSync;
const unirest = require('unirest');
const fs = require('fs');
const replaceStream = require('replacestream');

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
        exec('docker-compose up -d gitlab');
        this.waitForRunning().then(() => {
          console.log('finished');
          resolve();
        });
      });
    });
  },

  waitForRunning: function() {
    console.log('waiting');
    return new Promise((resolve, reject) => {
      this.status().then((status) => {
        if (status === 'RUNNING') {
          resolve()
        } else {
          setTimeout(() => {
            this.waitForRunning()
          }, 5000);
        }
      });
    });
  },

  status: function() {
    return new Promise((resolve, reject) => {
      unirest.get(`http://0.0.0.0:${this.manifest.env.PORT}`)
      .timeout(5000)
      .end((response) => {
        console.log(response.status);
        resolve(response.status === 200 ? 'RUNNING' : 'STOPPED')
      });
    });
  },
}
