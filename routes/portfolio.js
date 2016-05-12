var express = require('express'),
    ajax = require('../utils/ajax'),
    log4js = require('log4js'),
    router = express.Router();

var requestLog = log4js.getLogger('request');

/* 投顾组合列表 */
router.get('/advisor_portfolio_list', function(req, res, next) {
  var username = req.session.userToken,
      password = req.session.pwd,
      oldPtfUrl = 'http://192.168.1.180:9300/ptf?a=' + username + '&b=' + password;

  requestLog.info('跳转页面成功：【' + oldPtfUrl + '】');

  res.redirect(oldPtfUrl);
});

// /* 投顾创建组合 */
// router.get('/advisor_create_portfolio', function(req, res, next) {
//   res.render('portfolio/advisor_create_portfolio', { title: '投顾创建组合' });

//   var url = 'user_api/user_login';


// });

module.exports = router;
