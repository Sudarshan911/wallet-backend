export default   {
  commonSkipFields: '-__v -updated_at -created_at',
  defaultOrderFields: ['asc', 'desc'],
  trashOperations: {
    unlikeComment: 'unlikeComment',
    delete: 'delete',
    unlikeContent: 'unlikeContent',
    removeContentFavourite: 'removeContentFavourite',
  },
  modelConfig: {
    wallet: {
      model: 'wallet',
      collection: 'wallets',
    },
    transaction: {
      model: 'transaction',
      collection: 'transactions',
    },
  },
  serviceResponseCodes: {
    success: 200,
    error: 400,
    serverError: 500,
    unauthorized: 401,
    dataNotFound: 404,
  },
  commonResponse: {
    serverError: 'An Error occurred please try again',
    notFound: 'Data not found.'
  },
  enums: {
    transactionType: ['Credit', 'Debit'],
    transactionTypeObject: { credit: 'Credit', debit: 'Debit'},
    minimumValidation: { min: 1 },
    initialTransaction : 'Initialising wallet'
  },

  baseAppUrl: 'http://localhost:3001',
  errorTypes: {
    'doesnt exist': 404,
  },

};
