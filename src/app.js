const slackClient = require('@slack/client');

const env = require('../env.config');
const utils = require('./utils');

const User = require('./models/User');
const FourDigit = require('./apps/FourDigit');


const rtm = new slackClient.RtmClient(env.slackBotToken, { autoReconnect: true, autoMark: true });
const apps = [];

function getGroup(id) {
  return rtm.dataStore.getChannelByName(env.slackBotChannel) || rtm.dataStore.getGroupByName(env.slackBotChannel);
}

rtm.on(slackClient.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  const { dataStore } = rtm;
  const activeGroup = getGroup(env.slackBotChannel);

  function sendMessage(messageText) {
    rtm.sendMessage(messageText, activeGroup.id);
  }

  FourDigit.init(sendMessage);
  apps.push(FourDigit);
});


rtm.on(slackClient.RTM_EVENTS.MESSAGE, function (message) {
  const group = getGroup(message.channel);

  if (group && group.name === env.slackBotChannel && message.text) {
    const slackUser = rtm.dataStore.getUserById(message.user);

    if (slackUser.is_bot) {
      return;
    }


    const text = utils.unformatMessage({ rtm, message: message.text });
    User.fetch(slackUser).then((user) => {
      const tasks = apps.map(app => app.emit(user, text));
      Promise.all(tasks)
      .then(results => {
        results
        .filter(Boolean)
        .map(result => rtm.sendMessage(result, message.channel))
      });
    });
  }
});


module.exports = {
  start() {
    rtm.start();
  },
};
