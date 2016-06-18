const FourDigit = require('../models/FourDigit');
const User = require('../models/User');
const lodash = require('lodash');


let gameModel;
let sendMessageToGroup;

const sayNextGame = no => sendMessageToGroup(`我宣布第 ${no} 屆猜數字大賽正式開始`);

function fetchRank() {
  return gameModel.fetchRank().then((rankList) => {
    const tasks = rankList.map((data, i) => {
      return User.fetchById(data.userID).then((user) => {
        const no = lodash.padEnd(i + 1, 3);
        const name = lodash.padEnd(user.getName(), 12);
        const count = lodash.padEnd(data.count, 3);
        return `No.${no}  ${name}  ${count}`;
      });
    });

    return Promise.all(tasks).then(list => `*猜數字英雄榜*\n\`\`\`${list.join('\n')}\`\`\``);
  });
}


module.exports = {
  init(sendMessage) {
    FourDigit.fetch().then((model) => {
      gameModel = model;
      sendMessageToGroup = sendMessage;
      model.nextGame().then(sayNextGame);
    });
  },

  emit(user, text) {
    if (text === '猜數字') {
      return fetchRank();
    }

    const matched = text.match(/(?:\D|\b)(\d{4})(?:\D|\b)/);

    if (!gameModel || !matched) {
      return Promise.resolve();
    }

    const digitsText = matched[1];

    if (/(\d).*\1/.test(digitsText)) {
      return Promise.resolve();
    }

    return gameModel.guess(user, digitsText)
    .then(({ no, count, result, isWin, winCount }) => {
      const resultText = `Round ${count}:   ${digitsText} -> *${result.a}A${result.b}B*`;

      if (isWin) {
        gameModel.nextGame().then(sayNextGame);
        return `${resultText}\n恭喜 @${user.getName()} 拿下第 ${no} 屆猜數字大賽冠軍，第 ${winCount} 次贏得比賽`;
      }

      return resultText;
    });
  },
};
