/*
 * 问答ajax
 * @qiulijun
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    router = express.Router();

// 加载问题
router.post('/moreQuestion', function(req, res) {

  var url = '/adviser/latest_qa_list';
  var params = {};

  params['module'] = 'adviser';
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

// 加载问题
router.post('/moreSameQuestion', function(req, res) {

  var url = '/adviser/stk_qa_list';
  var params = {};

  params['module'] = 'adviser';
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
