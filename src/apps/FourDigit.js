const FourDigit = require('../models/FourDigit');


let gameModel;
let sendMessageToGroup;

const sayNextGame = no => sendMessageToGroup(`我宣布第 ${no} 屆猜數字大賽正式開始`);


module.exports = {
  init(sendMessage) {
    FourDigit.fetch().then((model) => {
      gameModel = model;
      sendMessageToGroup = sendMessage;
      model.nextGame().then(sayNextGame);
    });
  },

  emit(user, text) {
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
