import swaggerDocument from './swagger-wallet.json' assert  { type: "json" };;
import  utilityConstants  from './constants/constants.js';


export const wallet = (req, res, next) => {
  swaggerDocument.host = req.get('host');
  req.swaggerDoc = swaggerDocument;

  swaggerDocument.info = {
    title: 'Wallet System',
    version: '1.0',
  };
  // let host = req.hostname;
  // const { protocol } = req;
  // const hostMap = {
  //   CONTENT_PORT: `${protocol}://${host}`,
  // };

  // if (host === utilityConstants.enums.localhost) {
  //   host = utilityConstants.enums.localhost;
  //   for (const service in hostMap) {
  //     hostMap[service] = `${protocol}://${host}:${process.env[service]}`;
  //   }
  // }
  // swaggerDocument.info.description = `  \t Available Swagger Endpoints:\n- [Content](${hostMap.CONTENT_PORT}/content/api/docs)\n- [Comment](${hostMap.COMMENT_PORT}/comment/api/docs)\n- [Like](${hostMap.LIKE_PORT}/like/api/docs)\n- [Channel Collection](${hostMap.CHANNEL_COLLECTION_PORT}/channel-collection/api/docs)\n- [Search](${hostMap.SEARCH_PORT}/search/api/docs)\n- [User](${hostMap.USER_PORT}/user/api/docs)\n- [Favourites](${hostMap.FAVOURITES_PORT}/favourites/api/docs)\n- [Public](${hostMap.PUBLIC_PORT}/public/api/docs)`;

  next();
};
