/*
 * 即时通信
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../utils/ajax'),
    utils = require('../utils/utils'),
    router = express.Router();

/* 拉取历史消息 */
router.post('/fetch_chat_history', utils.session, function(req, res) {
  var url = '/im_api/fetch_chat_history';

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
