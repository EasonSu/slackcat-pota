const slackClient = require('@slack/client');

const env = require('../env.config');
const utils = require('./utils');

const User = require('./models/User');


const rtm = new slackClient.RtmClient(env.slackBotToken, { autoReconnect: true, autoMark: true });

rtm.on(slackClient.RTM_EVENTS.MESSAGE, function (message) {
  const group = rtm.dataStore.getGroupById(message.channel);

  if (group && group.name === env.slackBotChannel && message.text) {
    const slackUser = rtm.dataStore.getUserById(message.user);

    if (slackUser.is_bot) {
      return;
    }


    const text = utils.unformatMessage({ rtm, message: message.text });
    User.fetch(slackUser).then((user) => {
      console.log(user.data, text);
    });
  }
});


module.exports = {
  start() {
    rtm.start();
  },
};
