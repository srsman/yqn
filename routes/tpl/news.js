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
router.get('/', function(req, res) {
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

      /* 判断文章类型 */
      var curNewsType;

      switch(newsListParams.params.type) {
        case 6:
          curNewsType = 'yaowen';
          break;
        case 7:
          curNewsType = 'zhibo';
          break;
        case 1:
          curNewsType = 'gupiao';
          break;
        default:
          curNewsType = newsListParams.params.type;
      }

      if(!newsListData.result) {
        newsListData.result = {};
      }

      newsListData.result.newsType = curNewsType;

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
router.get('/:type/:id', function(req, res) {
  var params = {};

  params['type'] = req.params.type;
  params['id'] = req.params.id;

  getNewsInfo(req, res, params);
});

/*
 * 兼容旧版新闻详情
 */
router.get('/:id', function(req, res) {
  var params = {};

  params['type'] = 1;
  params['id'] = req.params.id;

  getNewsInfo(req, res, params);
});

/*
 * 获取新闻详情
 */
function getNewsInfo(req, res, params) {
  var mainContentUrl = '/mktinfo_api/fetch_news_page_detail',
      viewpointUrl = '/adviser/fetch_adviser_note_list', // 精选观点
      questionUrl = '/adviser/latest_qa_list', // 最新问答
      newStockUrl = '/mktinfo_api/fetch_ipo_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      newsParams = {},
      viewpointParams = {},
      questionParams = {},
      newStockParams = {},
      brokerParams = {};

  // 新闻详情请求参数
  newsParams['module'] = 'market';
  newsParams['params'] = {};

  /* 判断文章类型 */
  var curNewsType = params.type,
      curNewsId = params.id;

  switch(curNewsType) {
    case 'yaowen':
      curNewsType = 6;
      break;
    case 'zhibo':
      curNewsType = 7;
      break;
    case 'gupiao':
      curNewsType = 1;
      break;
  }

  newsParams['params']['type'] = curNewsType;

  if(curNewsType === 1) {
    // 其他相关的新闻，现在只是股票相关
    mainContentUrl = '/mktinfo_api/fetch_news_detail';

    newsParams['params']['artid'] = curNewsId;
  } else {
    newsParams['params']['newsId'] = curNewsId;
  }

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 问答请求参数
  questionParams['module'] = 'adviser';
  questionParams['params'] = {};
  questionParams['params']['count'] = 3;

  // 观点请求参数
  viewpointParams['module'] = 'adviser';
  viewpointParams['params'] = {};
  viewpointParams['params']['count'] = 3;
  viewpointParams['params']['readId'] = 0;

  ajax.map.post({
    url: mainContentUrl,
    body: newsParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }, {
    url: questionUrl,
    body: questionParams
  }, {
    url: viewpointUrl,
    body: viewpointParams
  }).then(function(datas) {
    var mainContentData = datas[0],
        newStockData = datas[1],
        brokerData = datas[2],
        questionData = datas[3],
        viewpointsData = datas[4];

    if(mainContentData.code === 0 && mainContentData.result !== 'undefined' && newStockData.code === 0 && brokerData.code === 0 && questionData.code === 0 && viewpointsData.code === 0) {
      var seoCustomMeta = {},
          seoCustomDescription = mainContentData.result.data.content;

      seoCustomDescription = seoCustomDescription.replace('/<[^>]+>/', '');

      seoCustomMeta['title'] = mainContentData.result.data.title + '_热点新闻_一起牛';
      seoCustomMeta['keywords'] = mainContentData.result.data.title;
      seoCustomMeta['description'] = seoCustomDescription.substring(0, 99);
      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('news', seoCustomMeta);

      mainContentData.result.newsType = curNewsType;

      res.render('news/seo_info', {
        id: curNewsId,
        newsMain: mainContentData.result,
        widgetViewpoints: viewpointsData.result.data, // 精选观点
        widgetQuestions: questionData.result.qa, // 最新问答
        widgetNewStocks: newStockData.result.stks,
        widgetBrokers: brokerData.result.brokers,
        seoMeta: seoMeta,
        user: req.session.userInfo,
        moment:moment,
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
}

module.exports = router;
