/*
 * 问答
 * @qiulijun
 */

var express = require('express'),
    moment = require('moment'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    config = require('../../yiqiniu_config'),
    seoMeta = utils.seoMeta(),
    router = express.Router();

/*
 * 问答列表
 * @qiulijun
 */
router.get('/', function(req, res, next) {
  var questionUrl = '/adviser/latest_qa_list',
      stockUrl = '/mktinfo_api/fetch_stk_list',
      newStockUrl = '/mktinfo_api/fetch_ipo_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      ZXquestionParams = {},
      GPquestionParams = {},
      DPquestionParams = {},
      stockParams = {},
      newStockParams = {},
      brokerParams = {};

  // 最新问题请求参数
  ZXquestionParams['module'] = 'adviser';
  ZXquestionParams['params'] = {};
  ZXquestionParams['params']['count'] = 8;

  // 股票问题请求参数
  GPquestionParams['module'] = 'adviser';
  GPquestionParams['params'] = {};
  GPquestionParams['params']['count'] = 8;
  GPquestionParams['params']['qType'] = 1;

  // 大盘问题请求参数
  DPquestionParams['module'] = 'adviser';
  DPquestionParams['params'] = {};
  DPquestionParams['params']['count'] = 8;
  DPquestionParams['params']['qType'] = 2;

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
    url: stockUrl,
    body: stockParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: questionUrl,
    body: ZXquestionParams
  }, {
    url: questionUrl,
    body: GPquestionParams
  }, {
    url: questionUrl,
    body: DPquestionParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stockData = datas[0],
        newStockData = datas[1],
        zxQuestionData = datas[2],
        gpQuestionData = datas[3],
        dpQuestionData = datas[4],
        brokerData = datas[5];

    if(stockData.code === 0 && newStockData.code === 0 && zxQuestionData.code === 0 && gpQuestionData.code === 0 && dpQuestionData.code === 0 && brokerData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '有问必答，上万投顾在线为您及时解答';

      seoMeta = utils.seoMeta('question', seoCustomMeta);

      res.render('question/seo_list', {
        ZXquestions: zxQuestionData.result.qa,
        GPquestions: gpQuestionData.result.qa,
        DPquestions: dpQuestionData.result.qa,
        widgetStocks: stockData.result.stks,
        widgetNewStocks: newStockData.result.stks,
        widgetBrokers: brokerData.result.brokers,
        seoMeta: seoMeta,
        user: req.session.userInfo,
        flag : req.query.flag,
        moment: moment,
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function (data) {
    utils.errorHandler(res, data);
  });
});

/*
 * 问答详情
 * @qiulijun
 */
router.get('/:id', function(req, res, next) {
  var questionUrl = '/adviser/ask_qa_detail', //问答详情
      newStockUrl = '/mktinfo_api/fetch_ipo_list', //新股
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      adQuestionsUrl = '/adviser/adviser_square_qa', //投顾的问答
      adViewpointsUrl = '/adviser/fetch_viewpoint_list', //投顾的观点
      adInformationUrl = '/user_api/fetch_user_info', //投顾的信息
      params = {},
      newStockParams = {},
      brokerParams = {};

  // 问答详情请求参数
  params['module'] = 'adviser';
  params['params'] = {};
  params['params']['qId'] = req.params.id;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  ajax.post({
    url: questionUrl,
    body: params
  }).then(function(data) {
    var resData = data.result,
        stockId = resData.assetId,
        adviserId = resData.ans[0].uId;

    // 投顾相关信息 请求参数
    // 201330708 = 2^27 +2^26 + 2^12 + 2^4 + 2^2
    // 27 投资能力
    // 26 擅长领域
    // 12 投顾认证信息
    // 4 性别
    // 2 缩略头像
    var adviserParams = {
      module: 'user',
      params: {
        tarUserId: adviserId,
        flag: 201330708
      }
    };

    // 投顾相关观点 请求参数
    var viewpointParams = {
      module: 'adviser',
      params: {
        uId: adviserId,
        count: 3,
        readId: 0
      }
    };

    // 投顾相关问答 请求参数
    var questionsParams = {
      module: 'adviser',
      params: {
        tarUserId: adviserId,
        count: 3
      }
    };

    if(typeof stockId !== 'undefined') {
      var stockName = resData.assetName;
      var adviserInfo;

      /* 该问题有相关股票 */
      var sameQuestionParams = {
        module: 'adviser',
        params: {
          assetId: stockId
        }
      };

      // field详情
      // 0 资产ID
      // 1 资产名称
      // 2 现价
      // 3 最高
      // 4 最低
      // 5 开盘
      // 6 昨收
      // 7 成交额
      // 8 成交量
      // 9 涨跌
      // 10 涨跌幅
      // 15 时间戳
      var stockParams = {
        module: 'market',
        params: {
          assetIds: [stockId],
          fields: '0|1|2|3|4|5|6|7|8|9|10|15'
        }
      };

      ajax.map.post({
        url: '/adviser/stk_qa_list',
        body: sameQuestionParams
      }, {
        url: newStockUrl,
        body: newStockParams
      }, {
        url: '/mktinfo_api/get_quot',
        body: stockParams
      }, {
        url: adQuestionsUrl,
        body: questionsParams
      }, {
        url: adViewpointsUrl,
        body: viewpointParams
      }, {
        url: adInformationUrl,
        body: adviserParams
      }, {
        url: brokerUrl,
        body: brokerParams
      }).then(function(datas) {
        if(datas[0].code === 0 && datas[0].result !== 'undefined') {
          var seoCustomMeta = {};

          seoCustomMeta['title'] = stockName + '（' + stockId + '）的问答';
          seoCustomMeta['keywords'] = stockName + '股票分析，' + stockName + '在线提问，' + stockName + '走势预测，' + stockName + '如何操作';

          seoMeta = utils.seoMeta('question', seoCustomMeta);
          adviserInfo = datas[5].result;


          var qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = config.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          adviserInfo.thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + adviserId;

          res.render('question/seo_info', {
            id: req.params.id,
            data: resData,
            widgetNewStocks: datas[1].result.stks,
            widgetBrokers: datas[6].result.brokers,
            sameQuestions: datas[0],
            asset: datas[2].result.data,
            adQuestions: datas[3],
            adViewpoints: datas[4],
            adviserInfo: adviserInfo,
            seoMeta: seoMeta,
            user: req.session.userInfo,
            utils: utils
          });
        } else {
          utils.errorHandler(res, datas);
        }
      }, function (data) {
        utils.errorHandler(res, data);
      });
    } else {
      /* 该问题没有相关股票 */
      ajax.map.post({
        url: newStockUrl,
        body: newStockParams
      }, {
        url: brokerUrl,
        body: brokerParams
      }, {
        url: adQuestionsUrl,
        body: questionsParams
      }, {
        url: adViewpointsUrl,
        body: viewpointParams
      }, {
        url: adInformationUrl,
        body: adviserParams
      }).then(function(datas) {
        if(datas[0].code === 0 && datas[0].result !== 'undefined') {
          var seoCustomMeta = {};

          seoCustomMeta['title'] = '有问必答，上万投顾在线为您及时解答';

          seoMeta = utils.seoMeta('question', seoCustomMeta);
          adviserInfo = datas[4].result;
          var qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = config.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          adviserInfo.thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + adviserId;

          res.render('question/seo_info', {
            id: req.params.id,
            data: resData,
            widgetNewStocks: datas[0].result.stks,
            widgetBrokers: datas[1].result.brokers,
            adQuestions: datas[2],
            adViewpoints: datas[3],
            adviserInfo: adviserInfo,
            seoMeta: seoMeta,
            user: req.session.userInfo,
            utils: utils
          });
        } else {
          utils.errorHandler(res, datas);
        }
      }, function (datas) {
        utils.errorHandler(res, datas);
      });
    }
  }, function (data) {
    utils.errorHandler(res, data);
  });
});

module.exports = router;
