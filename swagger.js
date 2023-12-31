import swaggerDocument from './swagger-wallet.json' assert  { type: "json" };;


export const wallet = (req, res, next) => {
  swaggerDocument.host = req.get('host');
  req.swaggerDoc = swaggerDocument;

  swaggerDocument.info = {
    title: 'Wallet System',
    version: '1.0',
  };
  next();
};
