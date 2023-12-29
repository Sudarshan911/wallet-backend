import { validationResult, check } from 'express-validator';
import mongoose from 'mongoose';
import Decimal from 'decimal.js'
import { logger } from '../utils/logger.js';
import { returnValidationError } from '../helper/commonHelper.js';

let errorType = null;
export const validateGetWallet = [
    check('walletId')
        .trim()
        .custom((v) => mongoose.Types.ObjectId.isValid(v))
        .bail()
        .exists()
        .not()
        .isEmpty(),
    (req, res, next) => {
        try {
            logger.info('validateWallet@validateGetWallet');
            validationResult(req).throw();
            return next();
        } catch (err) {
            return returnValidationError(res, err, errorType);
        }
    },
];

export const validateCreateWallet = [
    check('balance')
        .optional()
        .trim()
        .exists()
        .not()
        .isEmpty()
        .isInt({ min: 0 })
        .isNumeric()
        .custom((value) => {
            // Custom validation for 4 decimal places
            const decimalValue = new Decimal(value);
            return decimalValue.decimalPlaces() <= 4;
        })
        .withMessage('Maximum prcision limit is 4.'),
    check('name')
        .trim()
        .exists()
        .not()
        .isEmpty(),
    (req, res, next) => {
        try {
            logger.info('validateWallet@validateCreateWallet');
            validationResult(req).throw();
            return next();
        } catch (err) {
            return returnValidationError(res, err, errorType);
        }
    },
];

