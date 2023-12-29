/* eslint-disable no-undef */
const request = require('supertest');
const axios = require('axios');
const mongoose = require('mongoose');
const app = require('../main');
const { utilityConstants } = require('../constants/constants');
const { connectWithRetry } = require('../utils/mongoose');
const { logger } = require('../utils/logger');

describe('Testing wakau comments API ', () => {
  const endpoint = '/comment';
  let staticUserCode = '';
  let staticAuthorization = '';
  let mockCommentId = '';
  let mockCommentReplyId = '';
  const mockContentId = '646ddc735c2453816789f13a';
  const commentIdAnotherUser = '6458949c0b8eb85dcbb02b55';
  const commentReplyIdAnotherUser = '645894d00b8eb85dcbb02b56';

  const staticTagUsers = 'test-GYN2F3#2860-1607507323,WK-ESU7YV#3975-1607435342,WK-9HKTFM#8615-1607434824';
  const staticComment = 'staticTagUsers';
  const tempStaticAuthorization = process.env.TEST_USER_TOKEN;
  const testUserName = process.env.TEST_USER_NAME;
  const testUserEmail = process.env.TEST_USER_EMAIL;
  const testUserId = process.env.TEST_USER_ID;
  const nonExistingId = '111111111111111111111111';
  const disabledCommentContentId = '646dd9105c2453816789f139';
  const invalidObjectId = 'qwdqdq123';
  const commentReplyId = '5ff6b80401757b55ff70014e';
  beforeAll(async () => {
    logger.silent = true;
    // jest.setTimeout(30000);
    await connectWithRetry();

    await require('../service/testDataPreparation')();

    const LoginResponse = await axios
      .post(
        `http://localhost:${process.env.USER_PORT}/user/login`,
        {
          name: testUserName,
          userId: testUserId,
          loginType: 1,
          emailId: testUserEmail,
          deviceId: utilityConstants.testCaseData.staticDeviceId,
          platform: utilityConstants.testCaseData.staticPlatform,
          firebaseToken: utilityConstants.testCaseData.staticFirebaseToken,
        },
        {
          headers: { Authorization: tempStaticAuthorization },
        },
      );

    staticAuthorization = LoginResponse.data.token;
    staticUserCode = LoginResponse.data.userCode;
  });

  afterAll(async (done) => {
    await require('../service/testDataRemoval')();
    logger.silent = false;
    mongoose.connection.close();
    done();
  });

  it('Should add comment', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/add-comment`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        contentId: mockContentId,
        comment: staticComment,
        tagUsers: staticTagUsers,
        userCode: staticUserCode,
      });
    mockCommentId = response.body._id;
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('userName');
    expect(response.body).toHaveProperty('comment');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/add-comment`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
      });

    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('contentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment to non existing content', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/add-comment`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        contentId: nonExistingId,
        comment: staticComment,
        tagUsers: staticTagUsers,
        userCode: staticUserCode,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.dataNotFound);
    expect(response.body.param).toEqual('contentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment to content with comments disabled', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/add-comment`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        contentId: disabledCommentContentId,
        comment: staticComment,
        tagUsers: staticTagUsers,
        userCode: staticUserCode,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('contentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should update comment', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/${mockCommentId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('userName');
    expect(response.body).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to update comment', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/${mockCommentId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to update comment of another user', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/${commentIdAnotherUser}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.unauthorized);
    expect(response.body).toHaveProperty('error');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to update non existing comment', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/${nonExistingId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.dataNotFound);
    expect(response.body.param).toEqual('commentId');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch all comments', async (done) => {
    const response = await request(app)
      .get(endpoint)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, contentIds: mockContentId, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, userCodes: staticUserCode, contentUserCode: staticUserCode,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    likedComment = response.body.dataList[0]._id;
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch comment by commentId', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/64a5624c47015af16cc35dc5`)
      .set('authorization', staticAuthorization);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('userName');
    expect(response.body).toHaveProperty('comment');
    expect(response.body.contentDetails).toHaveProperty('contentDescription');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to fetch content with invalid commentId', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/${nonExistingId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.dataNotFound);
    expect(response.body.param).toEqual('commentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch all comments with user data', async (done) => {
    const response = await request(app)
      .get(`${endpoint}`)
      .set('authorization', staticAuthorization)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, contentIds: mockContentId, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, userCodes: staticUserCode,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch comments by commentId', async (done) => {
    const response = await request(app)
      .get(`${endpoint}`)
      .set('authorization', staticAuthorization)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, contentIds: mockContentId, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, commentIds: `${mockCommentId},${mockCommentId}`,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to fetch all comments', async (done) => {
    const response = await request(app)
      .get(`${endpoint}`)
      .set('authorization', staticAuthorization)
      .query({
        contentIds: '1231',
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('contentIds');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should add comment reply', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/comment-reply/add-comment-reply`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        commentId: mockCommentId,
        contentId: mockContentId,
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    mockCommentReplyId = response.body._id;
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment reply to non existing content', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/comment-reply/add-comment-reply`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        contentId: nonExistingId,
        commentId: mockCommentId,
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('contentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment reply to non existing comment', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/comment-reply/add-comment-reply`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        contentId: mockContentId,
        commentId: nonExistingId,
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('commentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment reply when comments are disabled', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/comment-reply/add-comment-reply`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        contentId: disabledCommentContentId,
        commentId: mockCommentId,
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('contentId');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to add comment reply', async (done) => {
    const response = await request(app)
      .post(`${endpoint}/comment-reply/add-comment-reply`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('contentId');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch all comment replies for single comment', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies`)
      .set('authorization', staticAuthorization)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, commentIds: mockCommentId,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    likedCommentReply = response.body.dataList[0]._id;
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch single comment reply details', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies/${commentReplyId}`)
      .set('authorization', staticAuthorization);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('is_reply');
    expect(response.body).toHaveProperty('comment');
    expect(response.body).toHaveProperty('contentDetails');
    expect(response.body).toHaveProperty('commentDetails');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to fetch single comment reply details', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies/${nonExistingId}`)
      .set('authorization', staticAuthorization);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.dataNotFound);
    expect(response.body.param).toEqual('commentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch all comment replies for single comment by contentId', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies`)
      .set('authorization', staticAuthorization)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, commentIds: mockCommentId, contentIds: `${mockContentId},${mockContentId}`,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fetch all comment replies for multiple comments', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies`)
      .set('authorization', staticAuthorization)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, commentIds: `${mockCommentId},${mockCommentId}`,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to fetch comment reply', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies`)
      .set('authorization', staticAuthorization)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, commentIds: invalidObjectId,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('commentIds');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should edit comment reply', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/comment-reply/${mockCommentReplyId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        comment: 'Okay,comment tested.',
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('userName');
    expect(response.body).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to edit comment reply', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/comment-reply/${mockCommentReplyId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to edit comment reply with non existing comment', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/comment-reply/${nonExistingId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        tagUsers: staticTagUsers,
        comment: 'Okay,comment tested.',
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('commentId');

    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to update comment reply of another user', async (done) => {
    const response = await request(app)
      .patch(`${endpoint}/comment-reply/${commentReplyIdAnotherUser}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .send({
        comment: staticComment,
        tagUsers: staticTagUsers,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.unauthorized);
    expect(response.body).toHaveProperty('error');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should again fetch all comment replies for single comment', async (done) => {
    const response = await request(app)
      .get(`${endpoint}/comment-replies`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode)
      .query({
        limit: utilityConstants.testCaseData.limit, page: utilityConstants.testCaseData.page, orderBy: utilityConstants.testCaseData.orderBy, sortBy: utilityConstants.testCaseData.sortBy, commentIds: mockCommentId,
      });
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body.dataList[0]).toHaveProperty('userName');
    expect(response.body.dataList[0]).toHaveProperty('comment');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should delete comment reply', async (done) => {
    const response = await request(app).delete(`${endpoint}/comment-reply/${mockCommentReplyId}`).set('authorization', staticAuthorization).set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('ParentcommentReplyCount');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to delete comment reply again', async (done) => {
    const response = await request(app).delete(`${endpoint}/comment-reply/${mockCommentReplyId}`).set('authorization', staticAuthorization).set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('commentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to delete comment reply of another user', async (done) => {
    const response = await request(app)
      .delete(`${endpoint}/comment-reply/${commentReplyIdAnotherUser}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.unauthorized);
    expect(response.body).toHaveProperty('error');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should delete comment', async (done) => {
    const response = await request(app).delete(`${endpoint}/${mockCommentId}`).set('authorization', staticAuthorization).set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.success);
    expect(response.body).toHaveProperty('commentCount');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to delete  deleted comment', async (done) => {
    const response = await request(app)
      .delete(`${endpoint}/${mockCommentId}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.error);
    expect(response.body.param).toEqual('commentId');
    done();
  }, utilityConstants.testCaseData.timeOut);

  it('Should fail to delete comment of another user', async (done) => {
    const response = await request(app)
      .delete(`${endpoint}/${commentIdAnotherUser}`)
      .set('authorization', staticAuthorization)
      .set('userCode', staticUserCode);
    expect(response.status).toEqual(utilityConstants.serviceResponseCodes.unauthorized);
    expect(response.body).toHaveProperty('error');
    done();
  }, utilityConstants.testCaseData.timeOut);
});
