/*
 * 观点ajax
 * @qiulijun
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    router = express.Router();


// 加载观点-精选观点
router.post('/featuredVPs', function(req, res) {

  var url = '/adviser/fetch_adviser_note_list';
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


// 加载观点-人气观点
router.post('/hotVPs', function(req, res) {

  var url = '/adviser/fetch_viewpoint_list_by_type';
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