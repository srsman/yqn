/*
 * 股票
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    router = express.Router();

/* 查询股票 */
router.post('/query', function(req, res) {
  var url = '/mktinfo_api/search_mkt';

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

// 获取更多股票相关资讯
router.post('/moreNews', function(req, res) {
  var url = '/mktinfo_api/fetch_news_list';
  var params = {};

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

// 获取更多股票相关问答
router.post('/moreQuestion', function(req, res) {
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

// 获取更多股票相关观点
router.post('/moreViewpoint', function(req, res) {
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
