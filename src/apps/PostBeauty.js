const env = require('../../env.config');
const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const uuid = require('node-uuid');
const utils = require('../utils');
const { bucket } = require('../db');

const IMAGES_PATH = path.resolve(__dirname, '../..', env.beautyImagePath);
const DONE_PATH = path.resolve(IMAGES_PATH, '__done__');
const DEST_FOLDER = env.isDev ? 'beauty-dev/' : 'beauty/';

let sayMessage;
const images = [];


function createFolder(filePath) {
  const relativePath = filePath.replace(`${IMAGES_PATH}${path.sep}`, '');
  const folders = path.dirname(relativePath).split(path.sep);

  folders.reduce((folderPath, folder) => {
    const nextPath = folderPath + path.sep + folder;

    try {
      fs.accessSync(nextPath);
    } catch (err) {
      fs.mkdirSync(nextPath);
    }

    return nextPath;
  }, IMAGES_PATH);
}

function pickImage() {
  if (!images.length) {
    return null;
  }

  const index = Math.floor(Math.random() * images.length);
  return images.splice(index, 1)[0];
}

function uploadToBucket(imagePath) {
  return new Promise((resolve, reject) => {
    const destination = DEST_FOLDER + uuid.v4() + path.extname(imagePath);

    bucket.upload(imagePath, { public: true, destination }, (err, file) => {
      if (err) {
        return reject(err);
      }
      resolve({ imagePath, file, url: file.metadata.mediaLink });
    });
  });
}

function moveUploadedImage(data) {
  return new Promise((resolve, reject) => {
    const { imagePath } = data;
    const newImagePath = imagePath.replace(IMAGES_PATH, DONE_PATH);

    createFolder(newImagePath);

    fs.rename(imagePath, newImagePath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}


module.exports = {
  activeChannelName: env.slackBotChannel.beauty,

  init(sendMessage) {
    sayMessage = sendMessage;
    return utils.fetchAllImageFiles(IMAGES_PATH, images);
  },

  emit(user, text) {
    if (/表特一下/.test(text)) {
      const imagePath = pickImage();

      if (!imagePath) {
        return '嗚嗚嗚，沒有了';
      }


      sayMessage('我找找～');

      return uploadToBucket(imagePath)
      .then(moveUploadedImage)
      .then(data => `這個如何？\n${data.url}`)
      .catch((err) => {
        images.push(imagePath);
        return '嗚嗚嗚，發生錯誤了';
      });
    }
  },
};
