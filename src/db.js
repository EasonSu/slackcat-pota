const { firebaseConfig } = require('../env.config');
const firebase = require('firebase');

firebase.initializeApp({
  serviceAccount: firebaseConfig.serviceAccount,
  databaseURL: firebaseConfig.databaseURL,
});

const dbRef = firebase.database().ref(firebaseConfig.databaseName);
const usersRef = dbRef.child('users');


module.exports = {
  usersRef,
};
