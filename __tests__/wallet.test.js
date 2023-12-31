import request from 'supertest';
import mongoose from 'mongoose';
import app from '../main';
import  utilityConstants  from '../constants/constants';
import { connectWithRetry } from '../utils/mongoose';
import { logger } from '../utils/logger';

describe('Testing Wallet API ', () => {
  let staticWalletId = null;
  let invalidId = '123';
  
  beforeAll(async () => {
    logger.silent = true;
    jest.setTimeout(30000);
    await connectWithRetry();
  });

  afterAll(async (done) => {
    logger.silent = true;
    mongoose.connection.close();
    done();
  });

  it('Should create wallet', async (done) => {
    const response = await request(app)
      .post(`/setup`)
      .send({
        balance: 1000,
        name: 'test user',
      });
      staticWalletId = response.body._id
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('transactionId');
    expect(response.body).toHaveProperty('_id');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to create wallet without name', async (done) => {
    const response = await request(app)
      .post(`/setup`)
      .send({
        balance: 1000,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('name');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to create wallet with invalid balance', async (done) => {
    const response = await request(app)
      .post(`/setup`)
      .send({
        balance: -1000,
        name: 'test user',
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('balance');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to create wallet with invalid balance', async (done) => {
    const response = await request(app)
      .post(`/setup`)
      .send({
        balance: -1000,
        name: 'test user',
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('balance');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should get wallet details by walletId', async (done) => {
    const response = await request(app)
      .get(`/wallet/${staticWalletId}`);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('_id');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail get wallet details by invalid walletId', async (done) => {
    const response = await request(app)
      .get(`/wallet/${invalidId}`);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('walletId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should create Credit transaction', async (done) => {
    const response = await request(app)
      .post(`/transact/${staticWalletId}`)
      .send({
        "amount": 50,
        "description": "Phone recharge.",
        "transactionType": "Credit"
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('transactionId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should create Debit transaction', async (done) => {
    const response = await request(app)
      .post(`/transact/${staticWalletId}`)
      .send({
        "amount": 50,
        "description": "Phone recharge.",
        "transactionType": "Debit"
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('transactionId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to create transaction with invalid transactionType', async (done) => {
    const response = await request(app)
      .post(`/transact/${staticWalletId}`)
      .send({
        "amount": 50,
        "description": "Phone recharge.",
        "transactionType": "Deb"
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('transactionType');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to create transaction with invalid walletId', async (done) => {
    const response = await request(app)
      .post(`/transact/${invalidId}`)
      .send({
        "amount": 50,
        "description": "Phone recharge.",
        "transactionType": "Debit"
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('walletId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to create transaction with insufficient data', async (done) => {
    const response = await request(app)
      .post(`/transact/${staticWalletId}`)
      .send({
        "description": "Phone recharge.",
        "transactionType": "Debit"
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('amount');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should get transactions details for given walletId', async (done) => {
    const response = await request(app)
      .get(`/transactions`)
      .query({
        walletId: staticWalletId,
        page: 1,
        limit:10
    })
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.data[0]).toHaveProperty('walletId');
    expect(response.body.data[0]).toHaveProperty('newBalance');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should get all transactions details for given walletId', async (done) => {
    const response = await request(app)
      .get(`/transactions`)
      .query({
        walletId: staticWalletId,
        page: 1,
        limit: 'all',
        sortBy: 'amount',
        orderBy: 'desc'
    })
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.data[0]).toHaveProperty('walletId');
    expect(response.body.data[0]).toHaveProperty('newBalance');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to get transactions details for given walletId', async (done) => {
    const response = await request(app)
      .get(`/transactions`)
      .query({
        page: 1,
        limit:10
    })
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('walletId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to get transactions details for invalid walletId', async (done) => {
    const response = await request(app)
      .get(`/transactions`)
      .query({
        page: 1,
        limit: 10,
        walletId: invalidId,
    })
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('walletId');
    done();
  }, utilityConstants.testCaseData.timeOut);

});
