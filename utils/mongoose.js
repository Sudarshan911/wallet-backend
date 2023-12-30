import mongoose from 'mongoose'
import {logger} from './logger.js'

mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
    logger.info({
      mongoose: { collection: collectionName, method: methodName, arg: methodArgs },
    });
});
let count = 0;

const options = {
  autoIndex: false,
  poolSize: 10,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
};

export const connectWithRetry = (dbUrl = process.env.ATLAS_DNS) => {
  try {
    logger.info('Connecting... to MongoDB connection with retry');
    logger.info(dbUrl);
    return mongoose
      .connect(dbUrl, options)
      .then(() => {
        logger.info('MongoDB is connected');
      })
      .catch((err) => {
        logger.error(
          'MongoDB connection unsuccessful, retry after 5 seconds. ',
          ++count,
        );
        logger.error(err);
        logger.error('Retry MongoDB connection...');
        setTimeout(connectWithRetry, 5000);
      });
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
};