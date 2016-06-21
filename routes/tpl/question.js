/*
 * 问答
 * @qiulijun
 */

var express = require('express'),
    moment = require('moment'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    serverConfig = require('../../server_config'),
    seoMeta = utils.seoMeta(),
    router = express.Router();

/*
 * 问答列表
 * @qiulijun
 */
router.get('/', function(req, res) {
  var questionUrl = '/adviser/latest_qa_list',
      stockUrl = '/mktinfo_api/fetch_stk_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      adviserUrl = '/adviser/square_index', // 推荐投顾
      viewpointUrl = '/adviser/fetch_adviser_note_list', // 精选观点
      zxQuestionParams = {},
      gpQuestionParams = {},
      dpQuestionParams = {},
      stockParams = {},
      brokerParams = {},
      adviserParams = {},
      viewpointParams = {};

  // 最新问题请求参数
  zxQuestionParams['module'] = 'adviser';
  zxQuestionParams['params'] = {};
  zxQuestionParams['params']['count'] = 8;

  // 股票问题请求参数
  gpQuestionParams['module'] = 'adviser';
  gpQuestionParams['params'] = {};
  gpQuestionParams['params']['count'] = 8;
  gpQuestionParams['params']['qType'] = 1;

  // 大盘问题请求参数
  dpQuestionParams['module'] = 'adviser';
  dpQuestionParams['params'] = {};
  dpQuestionParams['params']['count'] = 8;
  dpQuestionParams['params']['qType'] = 2;

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 10;


  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 推荐投顾请求参数
  adviserParams['module'] = 'adviser';
  adviserParams['params'] = {};

  // 观点请求参数
  viewpointParams['module'] = 'adviser';
  viewpointParams['params'] = {};
  viewpointParams['params']['count'] = 3;
  viewpointParams['params']['readId'] = 0;

  // 转发请求
  ajax.map.post({
    url: stockUrl,
    body: stockParams
  }, {
    url: questionUrl,
    body: zxQuestionParams
  }, {
    url: questionUrl,
    body: gpQuestionParams
  }, {
    url: questionUrl,
    body: dpQuestionParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }, {
    url: adviserUrl,
    body: adviserParams
  }, {
    url: viewpointUrl,
    body: viewpointParams
  }).then(function(datas) {
    var stockData = datas[0],
        zxQuestionData = datas[1],
        gpQuestionData = datas[2],
        dpQuestionData = datas[3],
        brokerData = datas[4],
        adviserData = datas[5],
        viewpointData = datas[6];

    if(stockData.code === 0 && zxQuestionData.code === 0 && gpQuestionData.code === 0 && dpQuestionData.code === 0 && brokerData.code === 0 && adviserData.code === 0 && viewpointData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '有问必答，上万投顾在线为您及时解答';

      seoMeta = utils.seoMeta('question', seoCustomMeta);

      // 给投顾加上分享链接
      if(adviserData.result.niuRcmd.length > 0) {
        for(var i = 0; i < adviserData.result.niuRcmd.length; i++) {
          var item = adviserData.result.niuRcmd[i],
              thisUid = item.uId,
              thisUrl,
              qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = serverConfig.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + thisUid;

          adviserData.result.niuRcmd[i]['shareUrl'] = thisUrl;
        }
      }

      res.render('question/seo_list', {
        ZXquestions: zxQuestionData.result.qa,
        GPquestions: gpQuestionData.result.qa,
        DPquestions: dpQuestionData.result.qa,
        widgetRcmdAdviser: adviserData.result.niuRcmd,
        widgetStocks: stockData.result.stks,
        widgetBrokers: brokerData.result.brokers,
        widgetViewpoints: viewpointData.result.data,
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
router.get('/:id', function(req, res) {
  var questionUrl = '/adviser/ask_qa_detail', //问答详情
      widgetStockUrl = '/mktinfo_api/fetch_stk_list', //新股
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      adQuestionsUrl = '/adviser/adviser_square_qa', //投顾的问答
      adViewpointsUrl = '/adviser/fetch_viewpoint_list', //投顾的观点
      adInformationUrl = '/user_api/fetch_user_info', //投顾的信息
      params = {},
      widgetStockParams = {},
      brokerParams = {};

  // 问答详情请求参数
  params['module'] = 'adviser';
  params['params'] = {};
  params['params']['qId'] = req.params.id;

  // 新股请求参数
  widgetStockParams['module'] = 'market';
  widgetStockParams['params'] = {};
  widgetStockParams['params']['pageSize'] = 5;

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
        url: widgetStockUrl,
        body: widgetStockParams
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
          var seoCustomMeta = {},
              seoCustomDescription = stockName + '（' + stockId + '）' + resData.qContent + resData.ans[0].aContent;

          seoCustomDescription = seoCustomDescription.replace('/<[^>]+>/', '');

          seoCustomMeta['title'] = stockName + '（' + stockId + '）_问答_一起牛';
          seoCustomMeta['keywords'] = stockName + '（' + stockId + '）' + resData.qContent;
          seoCustomMeta['description'] = seoCustomDescription.substring(0, 99);
          seoCustomMeta['mixins'] = 1;

          seoMeta = utils.seoMeta('question', seoCustomMeta);

          adviserInfo = datas[5].result;

          var qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = serverConfig.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          adviserInfo.thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + adviserId;

          res.render('question/seo_info', {
            id: req.params.id,
            data: resData,
            widgetStocks: datas[1].result.stks,
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
        url: widgetStockUrl,
        body: widgetStockParams
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
          var seoCustomMeta = {},
              seoCustomDescription = resData.qContent + resData.ans[0].aContent;

          seoCustomDescription = seoCustomDescription.replace('/<[^>]+>/', '');

          seoCustomMeta['title'] = '老师对大盘未来趋势怎么看？_问答_一起牛';
          seoCustomMeta['keywords'] = resData.qContent;
          seoCustomMeta['description'] = seoCustomDescription.substring(0, 99);
          seoCustomMeta['mixins'] = 1;

          seoMeta = utils.seoMeta('question', seoCustomMeta);
          adviserInfo = datas[4].result;
          var qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = serverConfig.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          adviserInfo.thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + adviserId;

          res.render('question/seo_info', {
            id: req.params.id,
            data: resData,
            widgetStocks: datas[0].result.stks,
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
