import fs from 'fs';
import yaml from 'js-yaml';
import { exec } from 'child_process';

export const DEFAULT_OPTIONS = {
  gitlabPort: 80,
  helperPort: 30000,
  rootPassword: 'tricky-password',
  ip: '127.0.0.1',
  masterIp: '127.0.0.1'
}

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

export function generateTemplate(filename, options, image) {
  return new Promise((resolve, reject) => {
    var template = {};
    if (image === 'gitlab') {
      template = {
        'version': '2',
        'services': {
          'gitlab': {
            'image': 'gitlab/gitlab-ce:latest',
            'mem_limit': '6144m',
            'container_name': 'gitlab',
            'restart': 'always',
            'environment': {
              'GITLAB_OMNIBUS_CONFIG': [
                `external_url "http://${options.ip}:${options.gitlabPort}"`,
                `gitlab_rails['initial_root_password'] = "${options.rootPassword}"`,
                `gitlab_rails['gitlab_shell_ssh_port'] = 10022`,
                //TODO: Add email-related options here
              ].join('\n'),
            },
            'ports': [
              `${options.gitlabPort}:80`,
              '10022:10022'
            ],
            'expose': [
              options.gitlabPort.toString()
            ],
            'volumes': [
              '/etc/gitlab',
              '/var/log/gitlab',
              '/var/opt/gitlab'
            ],
          }
        }
      }
    } else if (image === 'gitlab-runner') {
      template = {
        'version': '2',
        'services': {
          'gitlab-runner': {
            'image': 'gitlab/gitlab-runner:latest',
            'container_name': 'gitlab-runner',
            'restart': 'always',
            'volumes': [
              '/var/run/docker.sock:/var/run/docker.sock'
            ]
          }
        }
      }
    }
    fs.writeFile(filename, yaml.safeDump(template), (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}
