const { firebaseConfig, gcloudConfig } = require('../env.config');
const firebase = require('firebase');


firebase.initializeApp({
  serviceAccount: firebaseConfig.serviceAccount,
  databaseURL: firebaseConfig.databaseURL,
});

const dbRef = firebase.database().ref(firebaseConfig.databaseName);
const usersRef = dbRef.child('users');
const fourDigitRef = dbRef.child('game/fourDigit');


const gcloud = require('gcloud')(gcloudConfig);
const storage = gcloud.storage();
const bucket = storage.bucket('slackcat-pota.appspot.com');


module.exports = {
  usersRef,
  fourDigitRef,
  bucket,
};
