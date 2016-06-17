const slackClient = require('@slack/client');

const env = require('../env.config');
const utils = require('./utils');


const rtm = new slackClient.RtmClient(env.slackBotToken);

rtm.on(slackClient.RTM_EVENTS.MESSAGE, function (message) {
  const group = rtm.dataStore.getGroupById(message.channel);

  if (group && group.name === env.slackBotChannel && message.text) {
    const text = utils.unformatMessage({ rtm, message: message.text });
    console.log(text);
  }
});


module.exports = {
  start() {
    rtm.start();
  },
};
