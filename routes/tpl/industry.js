/*
 * 行业
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
  var industryUrl = '/mktinfo_api/fetch_indu_page_list', // 行业列表
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      newsUrl = '/mktinfo_api/fetch_news_index', // 热点新闻
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      industryParams = {},
      newStockParams = {},
      newsParams = {},
      brokerParams = {};

  // 行业列表请求参数
  industryParams['module'] = 'market';
  industryParams['params'] = {};
  industryParams['params']['sortField'] = 0;
  industryParams['params']['sortDir'] = 'D';
  industryParams['params']['pageSize'] = 27;
  industryParams['params']['curPage'] = req.query.page || 1;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

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
    url: industryUrl,
    body: industryParams
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
    var industryData = datas[0],
        newStockData = datas[1],
        newsData = datas[2],
        brokerData = datas[3];

    if(industryData.code === 0 && newStockData.code === 0 && newsData.code === 0 && brokerData.code === 0) {
      /* SEO关键字处理 */
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '股票行业板块_市场_一起牛';

      seoCustomMeta['keywords'] = '股票行业，行业对比,行业排行，领涨行业,热门行业,行业新闻';

      seoCustomMeta['description'] = '一起牛行业频道:为您提供全面准确的行业信息，包括行业热点、行业分析、行业排行等，更好的挖掘行业机会，发现行业价值。';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('market', seoCustomMeta);

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

      res.render('industry/seo_list', {
        industry: industryData.result, // 行业列表
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetNews: newsData.result, // 热点新闻
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoMeta,
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

/* 行业详情 */
router.get('/:id', function(req, res) {
  var industryId = req.params.id,
      detailUrl = '/mktinfo_api/fetch_indu_detail', // 行业详情
      eventsUrl = '/mktinfo_api/fetch_indu_events', // 相关事件
      stksUrl = '/mktinfo_api/fetch_indu_stks', // 成分股
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      marketUrl = '/mktinfo_api/fetch_market_index', // 市场首页
      detailParams = {},
      eventsParams = {},
      stksParams = {},
      brokerParams = {},
      marketParams = {};

  // 行业详情请求参数
  detailParams['module'] = 'market';
  detailParams['params'] = {};
  detailParams['params']['induCode'] = industryId;

  // 相关事件请求参数
  eventsParams['module'] = 'market';
  eventsParams['params'] = {};
  eventsParams['params']['induCode'] = industryId;
  eventsParams['params']['count'] = 1;

  // 成分股请求参数
  stksParams['module'] = 'market';
  stksParams['params'] = {};
  stksParams['params']['induCode'] = industryId;
  stksParams['params']['count'] = 100;
  stksParams['params']['sortField'] = 1; // 按涨跌幅
  stksParams['params']['sortDir'] = 'D';

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 市场首页请求参数
  marketParams['module'] = 'market';
  marketParams['params'] = {};
  marketParams['params']['flag'] = 1 << 0 | 1 << 3;

  // 转发请求
  ajax.map.post({
    url: detailUrl,
    body: detailParams
  }, {
    url: eventsUrl,
    body: eventsParams
  }, {
    url: stksUrl,
    body: stksParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }, {
    url: marketUrl,
    body: marketParams
  }).then(function(datas) {
    var detailData = datas[0],
        eventsData = datas[1],
        stksData = datas[2],
        brokerData = datas[3],
        marketData= datas[4];

    if(detailData.code === 0 && eventsData.code === 0 && stksData.code === 0 && brokerData.code === 0 && marketData.code === 0) {
      /* SEO关键字处理 */
      var seoCustomMeta = {};

      seoCustomMeta['title'] = detailData.result.induName + '行业_股票行业板块_市场_一起牛';

      seoCustomMeta['keywords'] = detailData.result.induName + '，行业排行,领涨行业,成分股,行业新闻';

      seoCustomMeta['description'] = '一起牛行业板块为您提供' + detailData.result.induName + '行业实时行情数据，包括行业热点、行业分析、行业排行，成分股等，帮助您了解每日市场异动。';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('market', seoCustomMeta);

      res.render('industry/seo_info', {
        industryId: industryId,
        industryDetail: detailData.result, // 行业详情
        events: eventsData.result.news, // 相关事件
        stks: stksData.result.data, // 成分股
        widgetIndus: marketData.result.indus, // 领涨行业
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoMeta,
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

/* 相关事件列表 */
router.get('/:hid/xinwen', function(req, res) {
  var industryId = req.params.hid,
      industryUrl = '/mktinfo_api/fetch_indu_detail', // 行业详情
      eventsUrl = '/mktinfo_api/fetch_indu_events', // 相关事件
      stockUrl = '/mktinfo_api/fetch_stk_list', // 热门股票
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      industryParams = {},
      eventsParams = {},
      stockParams = {},
      newStockParams = {},
      brokerParams = {};

  // 行业详情请求参数
  industryParams['module'] = 'market';
  industryParams['params'] = {};
  industryParams['params']['induCode'] = industryId;

  // 相关事件请求参数
  eventsParams['module'] = 'market';
  eventsParams['params'] = {};
  eventsParams['params']['induCode'] = industryId;
  eventsParams['params']['count'] = 10;

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 10;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 转发请求
  ajax.map.post({
    url: industryUrl,
    body: industryParams
  }, {
    url: eventsUrl,
    body: eventsParams
  }, {
    url: stockUrl,
    body: stockParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var industryData = datas[0],
        eventsData = datas[1],
        stocksData = datas[2],
        newStockData = datas[3],
        brokerData = datas[4];

    if(industryData.code === 0 && eventsData.code === 0 && stocksData.code === 0 && newStockData.code === 0 && brokerData.code === 0) {
      /* SEO关键字处理 */
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '最新' + industryData.result.induName + '行业要闻直播_热点新闻_一起牛';

      seoCustomMeta['keywords'] = '要闻直播，经济数据，A股新闻，最新新闻，行业新闻，新闻资讯，新闻热点，今日股票新闻，新闻中心，所有新闻，今日股市，股票新闻头条，复牌公告，公告查询，认购公告，个股公告';

      seoCustomMeta['description'] = '一起牛为您提供' + industryData.result.induName + '行业新闻，实时报道股市，股票新闻通知，股市最大事项，7*24小时全球直播，上市公司直播。';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('market', seoCustomMeta);

      res.render('industry/seo_news_list', {
        industryId: industryId,
        industryDetail: industryData.result, // 行业详情
        events: eventsData.result.news, // 相关事件
        widgetStocks: stocksData.result.stks, // 热门股票
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoMeta,
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

/* 相关事件详情 */
router.get('/:hid/xinwen/:id', function(req, res) {
  var industryId = req.params.hid,
      newsId = req.params.id,
      industryUrl = '/mktinfo_api/fetch_indu_detail', // 行业详情
      detailUrl = '/mktinfo_api/fetch_news_detail', // 事件详情
      stockUrl = '/mktinfo_api/fetch_stk_list', // 热门股票
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      industryParams = {},
      detailParams = {},
      stockParams = {},
      newStockParams = {},
      brokerParams = {};

  // 行业详情请求参数
  industryParams['module'] = 'market';
  industryParams['params'] = {};
  industryParams['params']['induCode'] = industryId;

  // 事件详情请求参数
  detailParams['module'] = 'market';
  detailParams['params'] = {};
  detailParams['params']['artid'] = newsId;
  detailParams['params']['type'] = 1;

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 10;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 转发请求
  ajax.map.post({
    url: industryUrl,
    body: industryParams
  }, {
    url: detailUrl,
    body: detailParams
  }, {
    url: stockUrl,
    body: stockParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var industryData = datas[0],
        detailData = datas[1],
        stocksData = datas[2],
        newStockData = datas[3],
        brokerData = datas[4];

    if(industryData.code === 0 && detailData.code === 0 && stocksData.code === 0 && newStockData.code === 0 && brokerData.code === 0) {
      /* SEO关键字处理 */
      var seoCustomMeta = {},
          seoCustomDescription = detailData.result.data.content;

      seoCustomDescription = seoCustomDescription.replace('/<[^>]+>/', '');;

      seoCustomMeta['title'] = detailData.result.data.title + '_行业新闻_一起牛';

      seoCustomMeta['keywords'] = detailData.result.data.title;

      seoCustomMeta['description'] = seoCustomDescription.substring(0, 99);

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('market', seoCustomMeta);

      res.render('industry/seo_news_info', {
        industryId: industryId,
        industryDetail: industryData.result, // 行业详情
        detail: detailData.result, // 事件详情
        widgetStocks: stocksData.result.stks, // 热门股票
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoMeta,
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
