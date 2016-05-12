/*
 * 市场
 * @Author: 大发
 */

var express = require('express'),
    moment =require('moment'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    seoMeta = utils.seoMeta(),
    router = express.Router();

/* 首页 */
router.get('/', function(req, res, next) {
  var stockUrl = '/mktinfo_api/fetch_stk_list',
      newStockUrl = '/mktinfo_api/fetch_ipo_list',
      newsUrl = '/mktinfo_api/fetch_news_index',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockParams = {},
      newStockParams = {},
      newsParams = {},
      brokerParams = {};

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 20;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 20;

  // 新闻请求参数
  newsParams['module'] = 'market';
  newsParams['params'] = {};
  newsParams['params']['type'] = 6;
  newsParams['params']['count'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 转发请求
  ajax.map.post({
    url: stockUrl,
    body: stockParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: newsUrl,
    body: newsParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stocksData = datas[0],
        newStockData = datas[1],
        newsData = datas[2],
        brokerData = datas[3];

    if(stocksData.code === 0 && newStockData.code === 0 && newsData.code === 0 && brokerData.code === 0) {
      seoMeta = utils.seoMeta('market');

      res.render('market/seo_market', {
        stocks: stocksData.result, // 热门股票
        newStocks: newStockData.result, // 新股预告
        widgetNews: newsData.result.data, // 热点新闻
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        seoMeta: seoMeta,
        user: req.session.userInfo,
        moment: moment,
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

module.exports = router;
