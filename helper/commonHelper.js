import { logger } from '../utils/logger.js';
import  utilityConstants  from '../constants/constants.js';

export const expressResponseHandler = (
  page,
  limit,
  data,
  isReturnSingle = false,
) => (isReturnSingle
  ? data.docs[0] ?? []
  : {
    currentPage: parseInt(page),
    totalRecords: data.totalCount,
    perPage: parseInt(limit),
    previousPage: parseInt(page) - 1 > 0 ? parseInt(page) - 1 : null,
    lastPage: Math.ceil(data.totalCount / parseInt(limit)),
    nextPage: data.totalCount > parseInt(limit) * parseInt(page) ? parseInt(page) + 1 : null,
    data: data.docs,
  });


/**
 * returns validation error
 * @param {*} res
 * @param {*} err
 * @returns response object
 */
export const returnValidationError = (res, err, errorType = null) => {
  try {
    logger.info('commonHelper@returnValidationError');
    return res
      .status(
        utilityConstants.serviceResponseCodes.error,
      ) 
      .json(err.array()[0]);
  } catch (error) {
    throw new Error(error);
  }
};