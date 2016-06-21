/*
 * 联系人
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../utils/ajax'),
    utils = require('../utils/utils'),
    log4js = require('log4js'),
    serverConfig = require('../server_config'),
    qiniuEnv = process.env.NODE_ENV,
    router = express.Router();

var requestLog = log4js.getLogger('request');

/* 我的用户-默认页面 */
router.get('/list', utils.session, function(req, res) {
  var username = req.session.userToken,
      password = req.session.pwd,
      oldPtfUrl = serverConfig.env[qiniuEnv].oldWeb + '/crm/all?a=' + username + '&b=' + password;

  requestLog.info('跳转页面成功：【' + oldPtfUrl + '】');

  res.redirect(oldPtfUrl);
});

/* 查询联系人 */
router.post('/query', utils.session, function(req, res) {
  var url = '/adviser_crm_api/search_user';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 查询群组列表 */
router.post('/groups', utils.session, function(req, res) {
  var url = '/adviser_crm_api/fetch_group_list';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 查询联系人列表 */
router.post('/contacts', utils.session, function(req, res) {
  var url = '/adviser_crm_api/fetch_user_friend';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 查询用户信息 */
router.post('/user_info', utils.session, function(req, res) {
  var url = '/im_api/fetch_qnuser_info';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

module.exports = router;
