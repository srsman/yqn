/*
 * 行业
 */
var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    router = express.Router();

// 加载行业事件
router.post('/get_events', function(req, res) {
  var url = '/mktinfo_api/fetch_indu_events',
      params = {};

  params['module'] = 'market';
  params['params'] = req.body;

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

module.exports = router;
