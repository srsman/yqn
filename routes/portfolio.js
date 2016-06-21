var express = require('express'),
    ajax = require('../utils/ajax'),
    log4js = require('log4js'),
    serverConfig = require('../server_config'),
    qiniuEnv = process.env.NODE_ENV,
    router = express.Router();

var requestLog = log4js.getLogger('request');

/* 投顾组合列表 */
router.get('/advisor_portfolio_list', function(req, res, next) {
  var username = req.session.userToken,
      password = req.session.pwd,
      oldPtfUrl = serverConfig.env[qiniuEnv].oldWeb + '/ptf?a=' + username + '&b=' + password;

  requestLog.info('跳转页面成功：【' + oldPtfUrl + '】');

  res.redirect(oldPtfUrl);
});

module.exports = router;
