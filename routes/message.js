var express = require('express'),
    ajax = require('../utils/ajax'),
    utils = require('../utils/utils'),
    log4js = require('log4js'),
    fs = require('fs'),
    router = express.Router();

var routerLog = log4js.getLogger('router');

/*
* 获取消息接口
* qinxingjun
*/
router.route('/interface_update_check')
.post(utils.session, function(req, res) {

  var url = '/common_api/interface_update_check',
      params = {};

  params['params'] = req.body;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

//抛出
module.exports = router;