/*
 * 股票
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    serverConfig = require('../../server_config'),
    seoMeta = utils.seoMeta(),
    moment =require('moment'),
    router = express.Router();

/* 股票列表 */
router.get('/', function(req, res) {
  var stockUrl = '/mktinfo_api/fetch_stk_list', // 股票列表
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      marketUrl = '/mktinfo_api/fetch_market_index', // 市场首页
      stockParams = {},
      newStockParams = {},
      brokerParams = {},
      marketParams = {};

  // 股票列表请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 30;
  stockParams['params']['curPage'] = req.query.page || 1;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 市场首页请求参数
  marketParams['module'] = 'market';
  marketParams['params'] = {};
  marketParams['params']['flag'] = 1 << 0 | 1 << 3;

  ajax.map.post({
    url: stockUrl,
    body: stockParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }, {
    url: marketUrl,
    body: marketParams
  }).then(function(datas) {
    var stocksData = datas[0],
        newStockData = datas[1],
        broderData = datas[2],
        marketData= datas[3];

    if(stocksData.code === 0 && newStockData.code === 0 && broderData.code === 0 && marketData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = 'A股股票一览';

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_stock_list', {
        stocks: stocksData.result, // 热门股票
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetBrokers: broderData.result.brokers, // 推荐券商
        widgetIdxs: marketData.result.idxs, // 大盘指数
        widgetIndus: marketData.result.indus, // 领涨行业
        seoMeta: seoMeta,
        user: req.session.userInfo, // 用户Session信息
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票详情 */
router.get('/:id', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot', // 股票信息
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      skilledAdvisersUrl = '/adviser/fetch_skilled_advisers', // 擅长投顾
      stockNewsUrl = '/mktinfo_api/fetch_news_list', // 股票相关资讯
      stockQuestionUrl = '/adviser/stk_qa_list', // 股票相关问答
      stockViewpointUrl = '/adviser/fetch_viewpoint_list_by_type', // 股票相关观点
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockInfoParams = getStockParams(req.params.id),
      newStockParams = {},
      skilledAdvisersParams = {},
      brokerParams = {},
      stockNewsParams = {},
      stockNoticeParams = {},
      stockQuestionParams = {},
      stockViewpointParams = {};

  var assetId = req.params.id; // 资产ID

  // 新股列表
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 擅长投顾
  skilledAdvisersParams['module'] = 'adviser';
  skilledAdvisersParams['params'] = {};
  skilledAdvisersParams['params']['assetId'] = assetId;
  skilledAdvisersParams['params']['count'] = 3;

  // 相关新闻
  stockNewsParams['module'] = 'market';
  stockNewsParams['params'] = {};
  stockNewsParams['params']['assetId'] = assetId;
  stockNewsParams['params']['type'] = 1;
  stockNewsParams['params']['count'] = 10;

  // 相关公告
  stockNoticeParams['module'] = 'market';
  stockNoticeParams['params'] = {};
  stockNoticeParams['params']['assetId'] = assetId;
  stockNoticeParams['params']['type'] = 2;
  stockNoticeParams['params']['count'] = 10;

  // 相关问答
  stockQuestionParams['module'] = 'adviser';
  stockQuestionParams['params'] = {};
  stockQuestionParams['params']['assetId'] = assetId;
  stockQuestionParams['params']['count'] = 10;

  // 相关观点
  stockViewpointParams['module'] = 'adviser';
  stockViewpointParams['params'] = {};
  stockViewpointParams['params']['type'] = 'S';
  stockViewpointParams['params']['targetId'] = assetId;
  stockViewpointParams['params']['count'] = 10;
  stockViewpointParams['params']['readId'] = 0;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: skilledAdvisersUrl,
    body: skilledAdvisersParams
  }, {
    url: stockNewsUrl,
    body: stockNewsParams
  }, {
    url: stockNewsUrl,
    body: stockNoticeParams
  }, {
    url: stockQuestionUrl,
    body: stockQuestionParams
  }, {
    url: stockViewpointUrl,
    body: stockViewpointParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        newStockData = datas[1],
        skilledAdvisersData = datas[2],
        stockNewsData = datas[3],
        stockNoticeData = datas[4],
        stockQuestionData = datas[5],
        stockViewpointData = datas[6],
        brokerData = datas[7];

    if(stockInfoData.code === 0 && newStockData.code === 0 && skilledAdvisersData.code === 0 && stockNewsData.code === 0 && stockNoticeData.code === 0 && stockQuestionData.code === 0 && stockViewpointData.code === 0 && brokerData.code === 0) {
      var sName = stockInfoData.result.data[0][1],
          sId = stockInfoData.result.data[0][0],
          seoCustomMeta = {};

      seoCustomMeta['title'] = sName + '(' + sId + ')' + '股票行情一览表_市场_一起牛';

      seoCustomMeta['keywords'] = sName + '，' + sId + '，' + '公司简介，基本指标，大事提醒，财务分析，经营分析，同行比较，分红融资，股本结构，股东分析，新闻报道，个股公告，股票问答，投资观点，投顾服务';

      seoCustomMeta['description'] = '一起牛为您提供' + sName + '(' + sId + ')' + '股票实时行情，' + sName + '公司简介，' + sName + '基本指标，' + sName + '大事提醒，' + sName + '财务分析，' + sName + '经营分析，' + sName  + '同行比较，' + sName  + '分红融资，' + sName  + '股本结构，' + sName  + '股东分析，' + sName  + '新闻报道，' + sName  + '个股公告，' + sName  + '股票问答，' + sName  + '投资观点，' + sName  + '投顾服务等相关的信息。';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      // 给投顾加上分享链接
      if(skilledAdvisersData.result.data.length) {
        for(var i = 0; i < skilledAdvisersData.result.data.length; i++) {
          var item = skilledAdvisersData.result.data[i],
              thisUid = item.userId,
              thisUrl,
              qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = serverConfig.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + thisUid;

          skilledAdvisersData.result.data[i]['shareUrl'] = thisUrl;
        }
      }

      // 判断有没有新闻
      if(!stockNewsData.result) {
        stockNewsData['result'] = {};
        stockNewsData['result']['data'] = {};
      }

      // 判断有没有公告
      if(!stockNoticeData.result) {
        stockNoticeData['result'] = {};
        stockNoticeData['result']['data'] = {};
      }

      // 判断有没有问答
      if(!stockQuestionData.result) {
        stockQuestionData['result'] = {};
        stockQuestionData['result']['qa'] = {};
      }

      // 判断有没有观点
      if(!stockViewpointData.result.data) {
        stockViewpointData['result']['data'] = {};
      }

      stockNewsData.result.newsType = 'gupiao';

      res.render('stock/seo_stock_info', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        stockNews: stockNewsData.result, // 股票相关新闻
        stockNotice: stockNoticeData.result.data, // 股票相关公告
        stockQuestion: stockQuestionData.result.qa, // 股票相关问答
        stockViewpoint: stockViewpointData.result.data, // 股票相关观点
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetSkilledAdvisers: skilledAdvisersData.result.data, // 擅长投顾
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        seoMeta: seoMeta,
        user: req.session.userInfo, // 用户Session信息
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

/* 股票F10 - 公司资料 */
router.get('/:id/GSZL', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      gszlUrl = '/mktinfo_api/fetch_stk_index',
      stockInfoParams = getStockParams(req.params.id),
      gszlParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: gszlUrl,
    body: gszlParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        gszlData = datas[1];

    if(stockInfoData.code === 0 && gszlData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '公司简介_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '公司简介，' + seoId + '公司简介，' + '一起牛' + seoName + '(' + seoId + ')' + '公司简介';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '公司简介等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_gszl', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        gszlInfo: gszlData.result.corp, // 公司资料
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 大事提醒 */
router.get('/:id/DSTX', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      dstxUrl = '/mktinfo_api/fetch_stk_index',
      stockInfoParams = getStockParams(req.params.id),
      dstxParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: dstxUrl,
    body: dstxParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        dstxData = datas[1];

    if(stockInfoData.code === 0 && dstxData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '大事提醒_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '大事提醒，' + seoId + '大事提醒，' + '一起牛' + seoName + '(' + seoId + ')' + '大事提醒';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '大事提醒等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_dstx', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        dstxInfo: dstxData.result.event, // 大事提醒
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 财务分析-主要指标 */
router.get('/:id/ZYZB', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      zyzbUrl = '/mktinfo_api/fetch_stk_finance',
      stockInfoParams = getStockParams(req.params.id),
      zyzbParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: zyzbUrl,
    body: zyzbParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        zyzbData = datas[1];

    if(stockInfoData.code === 0 && zyzbData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '财务分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '财务分析，' + seoId + '财务分析，' + '一起牛' + seoName + '(' + seoId + ')' + '财务分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '主要指标，利润表，资产负载表，现金流量表等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_zyzb', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        zyzbInfo: zyzbData.result.data, // 主要指标
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 财务分析-利润表 */
router.get('/:id/LRB', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      lrbUrl = '/mktinfo_api/fetch_stk_profit',
      stockInfoParams = getStockParams(req.params.id),
      lrbParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: lrbUrl,
    body: lrbParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        lrbData = datas[1];

    if(stockInfoData.code === 0 && lrbData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '财务分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '财务分析，' + seoId + '财务分析，' + '一起牛' + seoName + '(' + seoId + ')' + '财务分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '主要指标，利润表，资产负载表，现金流量表等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_lrb', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        lrbInfo: lrbData.result, // 利润表
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 财务分析-资产负债表 */
router.get('/:id/ZCFZB', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      zcfzbUrl = '/mktinfo_api/fetch_stk_debt',
      stockInfoParams = getStockParams(req.params.id),
      zcfzbParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: zcfzbUrl,
    body: zcfzbParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        zcfzbData = datas[1];

    if(stockInfoData.code === 0 && zcfzbData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '财务分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '财务分析，' + seoId + '财务分析，' + '一起牛' + seoName + '(' + seoId + ')' + '财务分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '主要指标，利润表，资产负载表，现金流量表等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_zcfzb', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        zcfzbInfo: zcfzbData.result, // 资产负债表
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 财务分析-现金流量表 */
router.get('/:id/XJLLB', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      xjllbUrl = '/mktinfo_api/fetch_cash_flow',
      stockInfoParams = getStockParams(req.params.id),
      xjllbParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: xjllbUrl,
    body: xjllbParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        xjllbData = datas[1];

    if(stockInfoData.code === 0 && xjllbData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '财务分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '财务分析，' + seoId + '财务分析，' + '一起牛' + seoName + '(' + seoId + ')' + '财务分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '主要指标，利润表，资产负载表，现金流量表等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_xjllb', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        xjllbInfo: xjllbData.result, // 现金流量表
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 经营分析 */
router.get('/:id/JYFX', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      jyfxUrl = '/mktinfo_api/get_oper_analysis',
      stockInfoParams = getStockParams(req.params.id),
      jyfxParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: jyfxUrl,
    body: jyfxParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        jyfxData = datas[1];

    if(stockInfoData.code === 0 && jyfxData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '经营分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '经营分析，' + seoId + '经营分析，' + '一起牛' + seoName + '(' + seoId + ')' + '经营分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '经营分析等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_jyfx', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        jyfxInfo: jyfxData.result.data, // 经营分析
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 经营分析-具体分析项 */
router.get('/:id/JYFX/:date', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      jyfxUrl = '/mktinfo_api/get_oper_analysis',
      stockInfoParams = getStockParams(req.params.id),
      jyfxParams = getF10Params(req.params.id);

  jyfxParams['params']['date'] = req.params.date;

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: jyfxUrl,
    body: jyfxParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        jyfxData = datas[1];

    if(stockInfoData.code === 0 && jyfxData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '经营分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '经营分析，' + seoId + '经营分析，' + '一起牛' + seoName + '(' + seoId + ')' + '经营分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '经营分析等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_jyfx', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        jyfxInfo: jyfxData.result.data, // 经营分析
        dateItem: req.params.date, // 具体日期
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 分红融资 */
router.get('/:id/FHRZ', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      fhrzUrl = '/mktinfo_api/get_stk_div',
      stockInfoParams = getStockParams(req.params.id),
      fhrzParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: fhrzUrl,
    body: fhrzParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        fhrzData = datas[1];

    if(stockInfoData.code === 0 && fhrzData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '分红融资_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '分红融资，' + seoId + '分红融资，' + '一起牛' + seoName + '(' + seoId + ')' + '分红融资';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '分红融资等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_fhrz', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        fhrzInfo: fhrzData.result.data, // 分红融资
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 股东分析 */
router.get('/:id/GDFX', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      gdfxUrl = '/mktinfo_api/get_holder_analysis',
      stockInfoParams = getStockParams(req.params.id),
      gdfxParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: gdfxUrl,
    body: gdfxParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        gdfxData = datas[1];

    if(stockInfoData.code === 0 && gdfxData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '股东分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '股东分析，' + seoId + '股东分析，' + '一起牛' + seoName + '(' + seoId + ')' + '股东分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '股东分析等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_gdfx', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        gdfxInfo: gdfxData.result.data, // 股东分析
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 十大股东查询 */
router.get('/:id/GDFX/:date', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      sdgdUrl = '/mktinfo_api/get_top10holder_search',
      stockInfoParams = getStockParams(req.params.id),
      sdgdParams = getF10Params(req.params.id);

  sdgdParams['params']['date'] = req.params.date;

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: sdgdUrl,
    body: sdgdParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        sdgdData = datas[1];

    if(stockInfoData.code === 0 && sdgdData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '股东分析_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '股东分析，' + seoId + '股东分析，' + '一起牛' + seoName + '(' + seoId + ')' + '股东分析';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '股东分析等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_sdgd', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        sdgdInfo: sdgdData.result.data, // 十大股东
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 股本结构 */
router.get('/:id/GBJG', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      gbjgUrl = '/mktinfo_api/get_capStructure',
      stockInfoParams = getStockParams(req.params.id),
      gbjgParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: gbjgUrl,
    body: gbjgParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        gbjgData = datas[1];

    if(stockInfoData.code === 0 && gbjgData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '股本结构_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '股本结构，' + seoId + '股本结构，' + '一起牛' + seoName + '(' + seoId + ')' + '股本结构';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '股本结构等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_gbjg', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        gbjgInfo: gbjgData.result.data, // 股本结构
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票F10 - 同行比较 */
router.get('/:id/THBJ', function(req, res) {
  var stockInfoUrl = '/mktinfo_api/get_quot',
      thbjUrl = '/mktinfo_api/get_stk_sameindu',
      stockInfoParams = getStockParams(req.params.id),
      thbjParams = getF10Params(req.params.id);

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: thbjUrl,
    body: thbjParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        thbjData = datas[1];

    if(stockInfoData.code === 0 && thbjData.code === 0) {
      var getSeoCustomMetaParams = {},
          seoCustomMeta = {},
          seoName = stockInfoData.result.data[0][1],
          seoId = stockInfoData.result.data[0][0];

      seoCustomMeta['title'] = seoName + '(' + seoId + ')' + '同行比较_市场_一起牛';

      seoCustomMeta['keywords'] = seoName + '同行比较，' + seoId + '同行比较，' + '一起牛' + seoName + '(' + seoId + ')' + '同行比较';

      seoCustomMeta['description'] = '一起牛为您提供' + seoName + '(' + seoId + ')' + '同行比较等股票基本面分析，查询';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_f10_thbj', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        thbjInfo: thbjData.result, // 同行比较
        user: req.session.userInfo, // 用户Session信息
        seoMeta: seoCustomMeta,
        moment: moment,
        utils: utils,
        tag: 'f10'
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

// 返回获取股票信息参数
function getStockParams(id) {
  var stockInfoParams = {};

  /*
   * 股票详情
   * @fields:
   * 0: 资产ID[0]
   * 1: 资产名称[1]
   * 2: 现价[2]
   * 3: 最高[3]
   * 4: 最低[4]
   * 5: 开盘价[5]
   * 6: 昨收价[6]
   * 7: 成交额[7]
   * 8: 成交量[8]
   * 9: 涨跌[9]
   * 10: 涨跌幅[10]
   * 13: 涨停价[11]
   * 14: 跌停价[12]
   * 15: 时间戳[13]
   * 37: 换手率[14]
   * 38: 总市值[15]
   * 39: 市盈率[16]
   * 40: 市净率[17]
   * 41: 流通市值[18]
   * 42: 资产状态[19]
   * 73: 行业编号[20]
   * 74: 行业名称[21]
   */
  stockInfoParams['module'] = 'market';
  stockInfoParams['params'] = {};
  stockInfoParams['params']['assetIds'] = [id];
  stockInfoParams['params']['fields'] = '0|1|2|3|4|5|6|7|8|9|10|13|14|15|37|38|39|40|41|42|73|74';

  return stockInfoParams;
}

// 返回获取F10信息参数
function getF10Params(id) {
  var f10Params = {};

  f10Params['module'] = 'market';
  f10Params['params'] = {};
  f10Params['params']['assetId'] = id;

  return f10Params;
}

// 返回f10的seo关键字
function setF10SeoMeta(obj) {
  var seoCustomMeta = {},
      sName = obj.sName,
      sId = obj.sId;

  seoCustomMeta['title'] = sName + '(' + sId + ')' + '公司简介_市场_一起牛';

  seoCustomMeta['keywords'] = sName + '公司简介，' + sId + '公司简介，' + '一起牛' + sName + '(' + sId + ')' + '公司简介';

  seoCustomMeta['description'] = '一起牛为您提供' + sName + '(' + sId + ')' + '公司简介等股票基本面分析，查询';

  seoCustomMeta['mixins'] = 1;

  seoMeta = utils.seoMeta('stock', seoCustomMeta);

  return seoMeta;
}

module.exports = router;

