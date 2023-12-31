import express from 'express';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig()
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import bodyParser from 'body-parser';
import { logger } from './utils/logger.js';
import { connectWithRetry } from './utils/mongoose.js';
import walletRoute from './routes/wallet.js';
import { wallet } from './swagger.js';


const app = express();

// mongo request sanitize
app.use(
  mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      logger.warn(
        `Request: ${req.originalUrl} | This request[${key}] is sanitized`,
      );
    },
  }),
);

if (process.env.APP_ENV !== 'test') {
  connectWithRetry();
}

const port = process.env.PORT;
// Add Body Parser
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// CORS Middleware
app.use(cors());
app.use(compression());

const setOrigin = '*';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', setOrigin);
  res.setHeader('Cache-Control', 9600);
  next();
});

app.use('/', walletRoute);
if (process.env.APP_ENV !== 'test') {
  app.use('/api/docs', wallet, swaggerUi.serve, swaggerUi.setup());
}
app.use((req, res, next) => {
  const notFound = {
    message: 'Endpoint not found',
  };
  res.status(404).json(notFound);
});

if (process.env.APP_ENV !== 'test') {
  app.listen(port, (err) => {
    if (err) {
      logger.error('Error::', err);
    }
    logger.info(` Running server on from port - ${port}`);
  });
}

app.use((err, req, res,) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Something broke please try again after some time',
  });
});

process
  .on('unhandledRejection', (err) => {
    logger.error(err);
    logger.error('unhandledRejection thrown');
    process.exit(1);
  })
  .on('uncaughtException', (err) => {
    logger.error(err);
    logger.error('uncaughtException thrown');
    process.exit(1);
  });

export default app;
