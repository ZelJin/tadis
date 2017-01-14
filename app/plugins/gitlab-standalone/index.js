const masterNode = require('./master');
const slaveNode = require('./slave');

module.exports = {
  name: 'gitlab-standalone',
  description: 'test description',
  env: {
    PORT: 80,
    DEFAULT_PASSWORD: tricky-password,
    IP_ADDRESS: '192.168.1.115',
    MASTER_IP_ADDRESS: '192.168.1.68'
  },
  masterNode: masterNode,
  slaveNode: slaveNode
}

/*
var registrationToken = undefined;
console.log(masterNode);

masterNode.start().then(() => {
  return masterNode.getRegistrationToken()
}).then((token) => {
  registrationToken = token;
  return slaveNode.start()
}).then(() => {
  slaveNode.connectToMaster('192.168.2.188', registrationToken);
}).then(() => {
  console.log('Success!');
});
*/
