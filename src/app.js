const slackClient = require('@slack/client');

const env = require('../env.config');
const utils = require('./utils');

const User = require('./models/User');
const FourDigit = require('./apps/FourDigit');
const PostBeauty = require('./apps/PostBeauty');


const rtm = new slackClient.RtmClient(env.slackBotToken, { autoReconnect: true, autoMark: true });
const { dataStore } = rtm;
const apps = [FourDigit, PostBeauty];
let isAllAppInit = false;


function getChannelByName(name) {
  return dataStore.getChannelByName(name) || dataStore.getGroupByName(name);
}

function getChannelById(id) {
  return dataStore.getChannelById(id) || dataStore.getGroupById(id);
}


rtm.on(slackClient.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  const initTasks = apps.map((app) => {
    const { id } = getChannelByName(app.activeChannelName);

    function sendMessage(messageText) {
      rtm.sendMessage(messageText, id);
    }

    return app.init(sendMessage);
  });

  Promise.all(initTasks).then(() => {
    isAllAppInit = true;
  });
});


rtm.on(slackClient.RTM_EVENTS.MESSAGE, function (message) {
  const channel = getChannelById(message.channel);

  if (isAllAppInit && channel && message.text) {
    const slackUser = dataStore.getUserById(message.user);

    if (slackUser.is_bot) {
      return;
    }


    const text = utils.unformatMessage({ rtm, message: message.text });

    User.fetch(slackUser).then((user) => {
      const tasks = apps.map(app => channel.name === app.activeChannelName ? app.emit(user, text) : false);

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
