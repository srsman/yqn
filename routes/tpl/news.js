/*
 * 新闻
 * @qiulijun
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    seoMeta = utils.seoMeta(),
    moment = require('moment'),
    router = express.Router();

/*
 * 新闻列表
 */
router.get('/', function(req, res, next) {
  var newStockUrl = '/mktinfo_api/fetch_ipo_list',
      newsListUrl = '/mktinfo_api/fetch_news_page_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      newsListParams = {},
      newStockParams = {},
      brokerParams = {};

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 新闻请求参数
  newsListParams['module'] = 'market';
  newsListParams['params'] = {};
  newsListParams['params']['type'] = 7;
  newsListParams['params']['pageSize'] = 10;
  newsListParams['params']['curPage'] = req.query.page || 1;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 转发请求
  ajax.map.post({
    url: newStockUrl,
    body: newStockParams
  },{
    url: newsListUrl,
    body: newsListParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var newStockData = datas[0],
        newsListData = datas[1],
        brokerData = datas[2];

    if(newStockData.code === 0 && newsListData.code === 0 && brokerData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '最新要闻直播，股票新闻公告';

      seoMeta = utils.seoMeta('news', seoCustomMeta);

      res.render('news/seo_list', {
        newsInfo: newsListData.result,
        widgetNewStocks: newStockData.result.stks,
        widgetBrokers: brokerData.result.brokers,
        seoMeta: seoMeta,
        user: req.session.userInfo,
        moment:moment,
        utils:utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
 * 新闻详情
 */
router.get('/:id', function(req, res, next) {
  var mainContentUrl = '/mktinfo_api/fetch_news_detail',
      newStockUrl = '/mktinfo_api/fetch_ipo_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      params = {},
      newStockParams = {},
      brokerParams = {};

  // 新闻详情请求参数
  params['module'] = 'market';
  params['params'] = {};
  params['params']['artid'] = req.params.id;
  params['params']['type'] = 7;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  ajax.map.post({
    url: mainContentUrl,
    body: params
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var mainContentData = datas[0],
        newStockData = datas[1],
        brokerData = datas[2];

    if(mainContentData.code === 0 && mainContentData.result !== 'undefined' && newStockData.code === 0 && brokerData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = mainContentData.result.data.title;

      seoMeta = utils.seoMeta('news', seoCustomMeta);

      res.render('news/seo_info', {
        id: req.params.id,
        data: mainContentData.result.data,
        widgetNewStocks: newStockData.result.stks,
        widgetBrokers: brokerData.result.brokers,
        seoMeta: seoMeta,
        user: req.session.userInfo,
        moment:moment
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

module.exports = router;
