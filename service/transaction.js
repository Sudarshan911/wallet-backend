import { createTransactionData, getTransactionCount, getTransactionData } from "../odm/transaction.js";
import { getWalletData, updateWallet } from "../odm/wallet.js";
import utilityConstants from "../constants/constants.js";
import { logger } from "../utils/logger.js";
import { expressResponseHandler } from "../helper/commonHelper.js";

export const createTransaction = async (req, res) => {
    try {
        logger.info('transaction@createTransaction');
        const currentWalletData = await getWalletData(1, 1, null, { _id: req.params.walletId });
        const updatedBalance = (req.body.transactionType == utilityConstants.enums.transactionTypeObject.credit) ? currentWalletData.docs[0].balance + parseFloat(req.body.amount) : currentWalletData.docs[0].balance - parseFloat(req.body.amount)
        
        const [updateTransactionResponse] = await Promise.all(
            [
                createTransactionData({
                    walletId: req.params.walletId,
                    description: req.body.description,
                    amount: parseFloat(req.body.amount),
                    newBalance: updatedBalance ,
                    type: req.body.transactionType
                }),
                updateWallet({ _id: req.params.walletId }, { $inc: { balance: parseFloat( ((req.body.transactionType == utilityConstants.enums.transactionTypeObject.credit)) ? req.body.amount : -req.body.amount) } })
            ]
        )

        res.status(utilityConstants.serviceResponseCodes.success).json({ balance: updateTransactionResponse.newBalance, transactionId: updateTransactionResponse._id });
    } catch (error) {
        logger.error(error);
        res
            .status(utilityConstants.serviceResponseCodes.serverError)
            .json({ error: utilityConstants.commonResponse.serverError });
    }
}





export const getTransactions = async (req, res) => {
    try {
        logger.info('transaction@getTransactions');
        req.query.limit = (req.query.limit === 'all') ? (await getTransactionCount({ walletId: req.query.walletId })).totalCount : req.query.limit;
        const walletData = await getTransactionData(
            req.query.limit ? parseInt(req.query.limit) : 10,
            req.query.page ? parseFloat(req.query.page) : 1,
            (req.query.sortBy && req.query.orderBy) ? { [req.query.sortBy]: req.query.orderBy } : null,
            { walletId: req.query.walletId },
        {updatedAt: 0, __v:0})

        res.status(utilityConstants.serviceResponseCodes.success).json(expressResponseHandler(req.query.page, req.query.limit, walletData, false))
    } catch (error) {
        logger.error(error);
        res
            .status(utilityConstants.serviceResponseCodes.serverError)
            .json({ error: utilityConstants.commonResponse.serverError });
    }
}