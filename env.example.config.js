/**
  1. Copy this file and rename to 'env.config.js'
  2. Setup your config
*/

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    isDev: true,
    slackBotChannel: '<Activity channel of Slack bot>',
    slackBotToken: '<Token of Slack bot>',
    firebaseConfig: {
      serviceAccount: '<Firebase service account JSON file>',
      databaseURL: '<Firebase DB URL>',
      databaseName: '<Firebase DB namespace>',
    },
  },

  production: {
    isDev: false,
    slackBotChannel: '<Activity channel of Slack bot>',
    slackBotToken: '<Token of Slack bot>',
    firebaseConfig: {
      serviceAccount: '<Firebase service account JSON file>',
      databaseURL: '<Firebase DB URL>',
      databaseName: '<Firebase DB namespace>',
    },
  },
};


module.exports = config[env];
