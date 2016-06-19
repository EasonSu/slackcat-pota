const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const emoji = require('emoji-data');


function pipe(...fns) {
  if (fns.length === 1 && lodash.isArray(fns[0])) {
    return pipe(...fns[0]);
  }
  return initValue => fns.reduce((value, fn) => fn(value), initValue);
};


// <#C024BE7LR> --> #channel-name
// <@U024BE7LH> --> @user-name
const unformatChannelAndUser = ({ rtm, message }) => {
  const { dataStore } = rtm;
  return message.replace(/<([@#])([UC]\w+)>/g, (matched, type, id) => {
    const target = type === '@' ? dataStore.getUserById(id) : dataStore.getChannelById(id);
    if (target) {
      return `${type}${target.name}`;
    }
    return matched;
  });
};

const unformatHtmlEntity = (msg) => {
  const entityReverseMap = {
    gt: '>',
    lt: '<',
    amp: '&',
  };
  return msg.replace(/&([gl]t|amp);/g, (matched, key) => entityReverseMap[key] || matched);
};

// :emoji_name: --> emoji_char
const unformatEmoji = (msg) => {
  return msg.replace(/:([^:]+):/g, (matched, name) => {
    const emojiChar = emoji.from_short_name(name);
    if (emojiChar) {
      return emoji.unified_to_char(emojiChar.unified);
    }
    return matched;
  });
};

// <http://foo.com/> --> http://foo.com/
// <http://foo.com/|foo.com> --> foo.com
// <mailto:bar@foo.com|bar@foo.com> --> bar@foo.com
const unformatLink = (msg) => {
  return msg.replace(/<((?:https?:\/\/|mailto:)[^|>]+)(?:\|([^>]+))?>/g, (matched, url, text) => text || url);
};

// <!channel> -->  @channel
const unformatDefinedCommand = msg => msg.replace(/<!(channel|group|here|everyone)(?:\|@\1)?>/g, '@$1');

const unformatMessage = pipe(
  unformatChannelAndUser,
  unformatLink,
  unformatDefinedCommand,
  unformatHtmlEntity,
  unformatEmoji
);


function fetchAllImageFiles(dirPath, images = []) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      const folders = [];

      files.filter((file) => {
        const filePath = path.resolve(dirPath, file);

        if (/\.(jpe?g|png)$/i.test(file)) {
          images.push(filePath);
          return;
        }

        if (fs.statSync(filePath).isDirectory()) {
          folders.push(filePath);
        }
      });


      if (folders.length) {
        const tasks = folders.map(folder => fetchAllImageFiles(folder, images));
        resolve(Promise.all(tasks).then(() => images));
      } else {
        resolve(images);
      }
    });
  });
}


const utils = {
  $$inner: {
    unformatChannelAndUser,
    unformatLink,
    unformatDefinedCommand,
    unformatHtmlEntity,
    unformatEmoji,
  },
  pipe,
  unformatMessage,
  fetchAllImageFiles,
};


Object.keys(utils).forEach((funcName) => {
  const func = utils[funcName];

  if (lodash.isFunction(func) && /\bthis\b/.test(func.toString())) {
    utils[funcName] = func.bind(utils);
  }
});


module.exports = utils;
