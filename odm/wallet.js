import wallet from '../models/wallet.js';
import utilityConstants from "../constants/constants.js";
import { logger } from "../utils/logger.js"

export const getWalletData = (limit, page, sort, query, select = utilityConstants.commonSkipFields) => {
  logger.info('ORM::wallet@getWalletData');
  return new Promise((resolve, reject) => {
    wallet
      .find(query)
      .select(select)
      .sort(sort)
      .skip(limit * page - limit)
      .limit(limit)
      .lean()
      .exec()
      .then((docs) => {
        wallet
          .countDocuments(query)
          .then((totalCount) => {
            resolve({ docs, totalCount });
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const createWalletData = (body, session) => {
  logger.info('ORM::wallet@createWalletData');
  return new Promise((resolve) => {
    const walletData = new wallet(body);
    walletData.save(session, (err, item) => {
      if (err) {
        throw new Error(err);
      }
      resolve(item._doc);
    });
  });
};

export const updateWallet = (where, data, { session }) => {
  logger.info('ORM::wallet@updateWallet');
  return new Promise((resolve, reject) => {
    wallet.findOneAndUpdate(where, data, {
      new: true, setDefaultsOnInsert: true, runValidators: true, session
    })
      .lean()
      .exec()
      .then((response) => resolve(response)).catch((err) => {
        reject(err);
      });
  });
};

export const getWalletCount = (query) => {
  logger.info('ORM::wallet@getWalletCount');
  return new Promise((resolve) => {
    wallet
      .countDocuments(query)
      .then((totalCount) => {
        resolve({ totalCount });
      })
      .catch((err) => {
        logger.error(err);
        throw new Error(err);
      });
  });
};