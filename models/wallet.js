import mongoose from 'mongoose'
import Decimal from 'decimal.js'

import  utilityConstants  from '../constants/constants.js';

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

walletSchema.pre('save', function (next) {
  // Convert yourField to Decimal with maximum 4 decimal places
  const decimalValue = new Decimal(this.balance);
  this.balance =decimalValue.toDecimalPlaces(4);
  next();
});

export default  mongoose.model(
  utilityConstants.modelConfig.wallet.model,
  walletSchema,
  utilityConstants.modelConfig.wallet.collection,
);