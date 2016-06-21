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
router.get('/', function(req, res) {
  var stockUrl = '/mktinfo_api/fetch_stk_list', // 股票列表
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股列表
      newsUrl = '/mktinfo_api/fetch_news_index', // 热点新闻
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      marketUrl = '/mktinfo_api/fetch_market_index', // 市场首页
      stockParams = {},
      newStockParams = {},
      newsParams = {},
      brokerParams = {},
      marketParams = {};

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

  // 市场首页请求参数
  marketParams['module'] = 'market';
  marketParams['params'] = {};
  marketParams['params']['flag'] = 1 << 0 | 1 << 3;

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
  }, {
    url: marketUrl,
    body: marketParams
  }).then(function(datas) {
    var stocksData = datas[0],
        newStockData = datas[1],
        newsData = datas[2],
        brokerData = datas[3],
        marketData= datas[4];

    if(stocksData.code === 0 && newStockData.code === 0 && newsData.code === 0 && brokerData.code === 0 && marketData.code === 0) {
      seoMeta = utils.seoMeta('market');

      /* 判断文章类型 */
      var curNewsType;

      switch(newsParams.params.type) {
        case 6:
          curNewsType = 'yaowen';
          break;
        case 7:
          curNewsType = 'zhibo';
          break;
        default:
          curNewsType = newsParams.params.type;
      }

      newsData.result.newsType = curNewsType;

      res.render('market/seo_market', {
        stocks: stocksData.result, // 热门股票
        newStocks: newStockData.result, // 新股预告
        widgetIdxs: marketData.result.idxs, // 大盘指数
        widgetIndus: marketData.result.indus, // 领涨行业
        widgetNews: newsData.result, // 热点新闻
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
