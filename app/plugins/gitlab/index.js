import fs from 'fs';
import yaml from 'js-yaml';
import { exec } from 'child_process';

export const GITLAB_DEFAULT_OPTIONS = {
  gitlabPort: 80,
  helperPort: 30000,
  rootPassword: 'tricky-password',
  ip: '192.168.2.188',
  masterIp: '192.168.1.68'
}

export const DOCKER_COMPOSE_FILE = process.resourcesPath + '/docker-compose.yml';

export function execTask(task) {
  return new Promise((resolve, reject) => {
    exec(task, function(error, stdout, stderr) {
      if (error !== null) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function generateTemplate(options) {
  return new Promise((resolve, reject) => {
    var template = {
      'version': '2',
      'services': {
        'gitlab': {
          'image': 'gitlab/gitlab-ce:latest',
          'container_name': 'gitlab',
          'restart': 'always',
          'environment': {
            'GITLAB_OMNIBUS_CONFIG': [
              `external_url "http://${options.ip}:${options.gitlabPort}"`,
              `gitlab_rails['initial_root_password'] = "${options.rootPassword}"`,
              //TODO: Add email-related options here
            ].join('\n'),
          },
          'ports': [
            `${options.gitlabPort}:80`,
            '22:22'
          ],
          'expose': [
            options.gitlabPort.toString()
          ],
          'volumes': [
            '/etc/gitlab',
            '/var/log/gitlab',
            '/var/opt/gitlab'
          ]
        },
        'gitlab-runner': {
          'image': 'gitlab/gitlab-runner:latest',
          'container_name': 'gitlab-runner',
          'restart': 'always',
          'volumes': [
            '/var/run/docker.sock:/var/run/docker.sock',
            '/etc/gitlab-runner'
          ]
        }
      }
    }
    fs.writeFile(DOCKER_COMPOSE_FILE, yaml.safeDump(template), (err) => {
      if (err) console.error(err);
      resolve();
    });
  });
}
