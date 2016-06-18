const lodash = require('lodash');
const { fourDigitRef } = require('../db');

const ALL_DIGITS = lodash.range(10);


class FourDigit {
  constructor(ref) {
    this.ref = ref;
    this.gameRef = ref.child('game');
    this.winCountRef = ref.child('winCount');

    this.gameRef.on('value', (snap) => {
      var game = snap.val();

      if (game) {
        this.game = game;
      }
    });
  }

  nextGame() {
    const lastGame = this.game;

    if (lastGame) {
      if (lastGame.winnerID) {
        this.ref.child('history').push().set(lastGame);
      } else {
        return Promise.reject();
      }
    }

    const newGame = {
      no: lastGame ? lastGame.no + 1 : 1,
      digits: lodash.sampleSize(ALL_DIGITS, 4),
      count: 0,
    };

    return new Promise((resolve) => {
      this.gameRef.set(newGame, () => resolve(newGame.no));
    });
  }

  guess(user, digitsText) {
    const { game } = this;

    if (game.winnerID) {
      return Promise.reject();
    }

    const count = game.count + 1;
    const digits = digitsText.split('').map(Number);
    const result = game.digits.reduce((res, digit, i) => {
      if (digits[i] === digit) {
        res.a += 1;
      } else if (digits.indexOf(digit) !== -1) {
        res.b += 1;
      }
      return res;
    }, { a: 0, b: 0 });


    const isWin = result.a === 4;
    const userID = user.getID();
    const tasks = [];

    const updateTask = new Promise((resolve) => {
      const winnerID = isWin ? userID : null;
      this.gameRef.update({ winnerID, count }, resolve);
    });

    const pushRoundTask = new Promise((resolve) => {
      this.gameRef.child('rounds').push().set({ userID, result, digits: digitsText }, resolve);
    });

    tasks.push(updateTask, pushRoundTask);

    if (isWin) {
      tasks.push(new Promise((resolve) => {
        const userWinCountRef = this.winCountRef.child(userID);

        userWinCountRef.transaction(count => (count || 0) + 1, () => {
          userWinCountRef.once('value', snap => resolve(snap.val()));
        });
      }));
    }

    return Promise.all(tasks).then((res) => {
      return {
        no: game.no,
        count,
        result,
        isWin,
        winCount: res[2] || NaN,
      };
    });
  }

  fetchRank() {
    return new Promise((resolve, reject) => {
      this.winCountRef.orderByValue().once('value', (snap) => {
        if (snap.numChildren()) {
          const rankList = [];

          snap.forEach((data) => {
            rankList.push({ userID: data.key, count: data.val() });
          });

          rankList.reverse();
          return resolve(rankList);
        }
        reject();
      });
    });
  }
}


let fourDigit;

function createModel() {
  return new Promise((resolve) => {
    const model = new FourDigit(fourDigitRef);

    fourDigitRef.on('value', function waitInit(snap) {
      const data = snap.val();
      if (data) {
        fourDigitRef.off('value', waitInit);
        fourDigit = model;
        resolve(model);
      } else {
        fourDigitRef.set({ init: true });
      }
    })
  });
}

module.exports = {
  fetch() {
    if (fourDigit) {
      return Promise.resolve(fourDigit);
    }

    fourDigit = createModel();
    return fourDigit;
  },
};
