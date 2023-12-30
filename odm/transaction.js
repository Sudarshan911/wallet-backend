import  transaction  from '../models/transaction.js';
import { logger } from "../utils/logger.js"
import utilityConstants from "../constants/constants.js";

export const createTransactionData = (body) => {
    logger.info('ORM::transaction@createTransactionData');
    return new Promise((resolve, reject) => {
      const transactionData = new transaction(body);
      transactionData.save((err, item) => {
        if (err) {
          // throw new Error(err);
          return reject(err)
        }
        resolve(item._doc);
      });
    });
};
  
export const getTransactionData = (limit, page, sort, query, select = utilityConstants.commonSkipFields) => {
  logger.info('ORM::transaction@getTransactionData');
  return new Promise((resolve, reject) => {
    transaction
      .find(query)
      .select(select)
      .sort(sort)
      .skip(limit * page - limit)
      .limit(limit)
      .lean()
      .exec()
      .then((docs) => {
        transaction
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

export const getTransactionCount = (query) => {
  logger.info('ORM::transaction@getTransactionCount');
  return new Promise((resolve) => {
    transaction
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