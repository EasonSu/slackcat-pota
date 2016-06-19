/**
  1. Copy this file and rename to 'env.config.js'
  2. Setup your config
*/

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    isDev: true,
    beautyImagePath: '<Path relative to root of this project>',
    slackBotToken: '<Token of Slack bot>',

    slackBotChannel: {
      fourGame: '<Activity channel of fourGame>',
      beauty: '<Activity channel of beauty>',
    },

    firebaseConfig: {
      serviceAccount: '<Firebase service account JSON file>',
      databaseURL: '<Firebase DB URL>',
      databaseName: '<Firebase DB namespace>',
    },

    gcloudConfig: {
      projectId: '<Project ID on firebase>',
      keyFilename: '<gcloud service account JSON file>',
      email: '<your email>',
    },
  },

  production: {
    isDev: false,
    beautyImagePath: '<Path relative to root of this project>',
    slackBotToken: '<Token of Slack bot>',

    slackBotChannel: {
      fourGame: '<Activity channel of fourGame>',
      beauty: '<Activity channel of beauty>',
    },

    firebaseConfig: {
      serviceAccount: '<Firebase service account JSON file>',
      databaseURL: '<Firebase DB URL>',
      databaseName: '<Firebase DB namespace>',
    },

    gcloudConfig: {
      projectId: '<Project ID on firebase>',
      keyFilename: '<gcloud service account JSON file>',
      email: '<your email>',
    },
  },
};


module.exports = config[env];
