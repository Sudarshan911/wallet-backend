import { validationResult, check } from 'express-validator';
import mongoose from 'mongoose';
import Decimal from 'decimal.js'
import { logger } from '../utils/logger.js';
import { returnValidationError } from '../helper/commonHelper.js';
import utilityConstants from "../constants/constants.js";
import { getWalletCount, getWalletData } from '../odm/wallet.js';

let errorType = null;
export const validateCreateTransaction = [
    check('walletId')
        .trim()
        .custom((v) => mongoose.Types.ObjectId.isValid(v))
        .bail()
        .exists()
        .not()
        .isEmpty()
        .custom(async (v) => {
            const exists = await getWalletCount({ _id: v });
            if (exists.totalCount < 1) {
                throw new Error(utilityConstants.commonResponse.notFound);
            }
            return true
        })
        .withMessage('Not Found'),
    check('transactionType')
        .trim()
        .exists()
        .not()
        .isEmpty()
        .isIn(utilityConstants.enums.transactionType),
    check('amount')
        .trim()
        .exists()
        .isNumeric()
        .not()
        .isEmpty()
        .custom((value) => value > 0)
        .withMessage('Number must be greater than 0')
        .custom((value) => {
            // Custom validation for 4 decimal places
            const decimalValue = new Decimal(value);
            return decimalValue.decimalPlaces() <= 4;
        })
        .withMessage('Maximum prcision limit is 4.')
        .bail()
        .custom(async (value, { req }) => {
            if (req.body.transactionType === utilityConstants.enums.transactionTypeObject.credit) { return true }
            const walletBalance = await getWalletData(1, 1, {}, { _id: req.params.walletId });
            console.log(walletBalance.docs[0]?.balance > value);
            if (walletBalance.docs[0]?.balance < value) {
                throw new Error('Debit amount cant be greater than wallet balance');
            }
            }),
    check('description')
        .trim()
        .exists()
        .not()
        .isEmpty(),
    (req, res, next) => {
        try {
            logger.info('validateTransactions@validateCreateTransaction');
            validationResult(req).throw();
            return next();
        } catch (err) {
            return returnValidationError(res, err, errorType);
        }
    },
];

export const validateGetTransactions = [
    check('walletId')
        .trim()
        .custom((v) => mongoose.Types.ObjectId.isValid(v))
        .bail()
        .exists()
        .not()
        .isEmpty(),
    check('page')
        .optional()
        .trim()
        .exists()
        .not()
        .isEmpty()
        .isInt(utilityConstants.enums.minimumValidation)
        .isNumeric(),
    check('limit')
        .optional()
        .trim()
        .exists()
        .not()
        .isEmpty()
        .isInt(utilityConstants.enums.minimumValidation)
        .isNumeric(),
    check('sortBy')
        .optional()
        .trim(),
    check('orderBy')
        .optional()
        .trim()
        .isIn(utilityConstants.defaultOrderFields)
        .withMessage('Invalid orderBy field'),
    (req, res, next) => {
        try {
            logger.info('validateTransactions@validateGetTransactions');
            validationResult(req).throw();
            return next();
        } catch (err) {
            return returnValidationError(res, err, errorType);
        }
    },
];