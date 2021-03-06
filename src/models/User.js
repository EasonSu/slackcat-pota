const { usersRef } = require('../db');

const users = {};


class User {
  constructor(userRef) {
    this.ref = userRef;

    this.ref.on('value', snap => {
      this.data = snap.val();
    });
  }

  destory() {
    this.ref.off();
    this.ref = null;
    this.data = null;
  }

  getID() {
    return this.data.id;
  }

  getName() {
    return this.data.name;
  }

  getEscapedName() {
    return this.data.name.replace(/^./, function (c) {
      let code = c.charCodeAt(0);
      if (code >= 97 && code <= 122) {
        code += 9327;
      } else if (code >= 48 && code <= 57) {
        code += 9263;
      }
      return String.fromCharCode(code);
    });
  }
}


function createUser(slackUser) {
  return new Promise((resolve, reject) => {
    const userRef = usersRef.child(slackUser.id);
    const user = new User(userRef);

    userRef.once('value', (snap) => {
      const data = snap.val();

      if (data) {
        return resolve(user);
      }


      const initDate = {
        id: slackUser.id,
        name: slackUser.name,
        avatar: slackUser.profile.image_512,
        createTime: +new Date(),
      };

      userRef.set(initDate, (err) => {
        if (err) {
          return reject(user);
        }
        resolve(user);
      });
    });
  })
  .then((user) => {
    users[slackUser.id] = user;
    return user;
  })
  .catch(user => user.destory());
}


module.exports = {
  fetch(slackUser) {
    const { id } = slackUser;
    const user = users[id];

    if (user) {
      return Promise.resolve(user);
    }

    users[id] = createUser(slackUser);
    return users[id];
  },

  fetchById(id) {
    return this.fetch({ id });
  }
};
