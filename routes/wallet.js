import { createTransaction, getTransactions } from '../service/transaction.js';
import { createWallet, getWallet } from '../service/wallet.js';
import { validateCreateTransaction } from '../validator/validateTransaction.js';
import { validateCreateWallet, validateGetWallet } from '../validator/validateWallet.js';
import express from 'express';
var router = express.Router();

router.get('/wallet/:walletId', [validateGetWallet, getWallet,
]);

router.post('/wallet', [validateCreateWallet, createWallet])

router.post('/transact/:walletId', [validateCreateTransaction, createTransaction])
router.get('/transactions', [validateGetWallet, getTransactions,
]);

router.get('/', [(req, res) => res.json({ 'msg': 111 })
]);


export default router;





