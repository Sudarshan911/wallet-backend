import mongoose from 'mongoose'
import Decimal from 'decimal.js'

import utilityConstants from '../constants/constants.js';

const transactionSchema = new mongoose.Schema(
    {
        walletId: {
            type: mongoose.Types.ObjectId,
            ref: utilityConstants.modelConfig.wallet.collection,
            required: true,
        },
        description: {
            type: String,
            required: true,
            default: null,
        },
        amount: {
            type: Number,
            default: 0,
            required: true,
        },
        newBalance: {
            type: Number,
            default: 0,
            required: true,
            min: 0,
        },
        type: {
            type: String,
            required: true,
            enum: utilityConstants.enums.transactionType,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

transactionSchema.pre('save', function (next) {
    // Convert yourField to Decimal with maximum 4 decimal places
    console.log(this.amount);
    const decimalValue = new Decimal(this.amount);
    this.amount =decimalValue.toDecimalPlaces(4);

    const updatedBalance = new Decimal(this.newBalance);
    this.newBalance =updatedBalance.toDecimalPlaces(4);    // Call the next middleware or save the document
    next();
  });

export default mongoose.model(
    utilityConstants.modelConfig.transaction.model,
    transactionSchema,
    utilityConstants.modelConfig.transaction.collection,
);
