import mongoose from "mongoose";
import utilityConstants from "../constants/constants.js";
import { createTransactionData } from "../odm/transaction.js";
import { getWalletData, createWalletData } from "../odm/wallet.js";
import { logger } from "../utils/logger.js"

export const getWallet = async (req, res) => {
    try {
        logger.info('ORM::wallet@getWallet');
        const walletData = await getWalletData(1, 1, null, { _id: req.params.walletId })
        res.status(utilityConstants.serviceResponseCodes.success).json(walletData.docs[0])
    } catch (error) {
        logger.error(error);
        res
            .status(utilityConstants.serviceResponseCodes.serverError)
            .json({ error: utilityConstants.commonResponse.serverError });
    }
}


export const createWallet = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        logger.info('wallet@createWallet');
        session.startTransaction(); // Handling transactions to maintain consistancy
        const walletData = await createWalletData({ name: req.body.name, balance: req.body.amount }, { session })
        const transactionData = await createTransactionData({
            walletId: walletData._id,
            description: utilityConstants.enums.initialTransaction,
            amount: walletData.balance,
            newBalance: walletData.balance,
            type: utilityConstants.enums.transactionTypeObject.credit
        }, { session });

        await session.commitTransaction();
        res.status(utilityConstants.serviceResponseCodes.success).json({ _id: walletData._id, balance: walletData.balance, transactionId: transactionData._id, name: walletData.name, date: walletData.createdAt })
    } catch (error) {
        logger.error(error);
        res
            .status(utilityConstants.serviceResponseCodes.serverError)
            .json({ error: utilityConstants.commonResponse.serverError });
    }
    finally {
        session.endSession();
    }
}