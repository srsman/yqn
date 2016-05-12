/*
 * 观点
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
 * 观点列表
 * @qiulijun
 */
router.get('/', function(req, res, next) {
  var stockUrl = '/mktinfo_api/fetch_stk_list',
      newStockUrl = '/mktinfo_api/fetch_ipo_list',
      featuredVpUrl = '/adviser/fetch_adviser_note_list',
      hotVpUrl = '/adviser/fetch_viewpoint_list_by_type',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockParams = {},
      newStockParams = {},
      featuredVpParams = {},
      hotVpParams = {},
      brokerParams = {};

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 10;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 精选观点请求参数
  featuredVpParams['module'] = 'adviser';
  featuredVpParams['params'] = {};
  featuredVpParams['params']['count'] = 10;
  featuredVpParams['params']['readId'] = 0;

  // 人气观点请求参数
  hotVpParams['module'] = 'adviser';
  hotVpParams['params'] = {};
  hotVpParams['params']['count'] = 10;
  hotVpParams['params']['readId'] = 0;
  hotVpParams['params']['type'] = 'P';

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
    url: featuredVpUrl,
    body: featuredVpParams
  }, {
    url: hotVpUrl,
    body: hotVpParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stockData = datas[0],
        newStockData = datas[1],
        featuredVpData = datas[2],
        hotVpData = datas[3],
        brokerData = datas[4];

    if(stockData.code === 0 && newStockData.code === 0 && featuredVpData.code === 0 && hotVpData.code === 0 && brokerData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '观点直播，实时把握投资机会';

      seoMeta = utils.seoMeta('viewpoint', seoCustomMeta);

      res.render('viewpoint/seo_list', {
        featuredVps: featuredVpData.result.data,
        hotVps: hotVpData.result.data,
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
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
 * 观点详情
 * @qiulijun
 */
router.get('/:id', function(req, res, next) {
  var viewpoinrUrl = '/adviser/fetch_viewpoint_detail',
      newStockUrl = '/mktinfo_api/fetch_ipo_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      adQuestionsUrl = '/adviser/adviser_square_qa', //投顾的问答
      adViewpointsUrl = '/adviser/fetch_viewpoint_list', //投顾的观点
      adInformationUrl = '/user_api/fetch_user_info', //投顾的信息
      params = {},
      newStockParams = {},
      brokerParams = {};

  params['module'] = 'adviser';
  params['params'] = {};
  params['params']['viewpointId'] = req.params.id;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  ajax.post({
    url: viewpoinrUrl,
    body: params
  }).then(function(data) {
    if(data.code === 0 && data.result !== 'undefined') {
      var adviserId = data.result.uId,
          viewpointDetail = data.result;

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

      var viewpointParams = {
        module: 'adviser',
        params: {
          uId: adviserId,
          count: 3,
          readId: 0
        }
      };

      var questionsParams = {
        module: 'adviser',
        params: {
          tarUserId: adviserId,
          count: 3
        }
      };

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
          var seoCustomMeta = {},
              seoCustomKeywords = '',
              stkLables = viewpointDetail.stkLables;

          seoCustomMeta['title'] = viewpointDetail.title;

          var shareUrl, qiniuEnv, adviserInfo;
          adviserInfo = datas[4].result;
          qiniuEnv = process.env.NODE_ENV; // 当前的项目环境
          shareUrl = config.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;
          adviserInfo.thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + viewpointDetail.uId;

          if(stkLables && stkLables.length > 0) {
            for(var i = 0; i < stkLables.length; i++) {
              var stkName = stkLables[i].name;

              if(i === stkLables.length - 1) {
                seoCustomKeywords += stkName + '的观点，' + stkName + '的看法，' + stkName + '如何操作';
              } else {
                seoCustomKeywords += stkName + '的观点，' + stkName + '的看法，' + stkName + '如何操作，';
              }
            }

            seoCustomMeta['keywords'] = seoCustomKeywords;
          }

          seoMeta = utils.seoMeta('viewpoint', seoCustomMeta);

          res.render('viewpoint/seo_info', {
            id: req.params.id,
            data: viewpointDetail,
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

    } else if(data.code === 10016) {
      // 该观点不存在或已经删除
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '观点直播，实时把握投资机会';

      seoMeta = utils.seoMeta('viewpoint', seoCustomMeta);

      res.render('viewpoint/no_result', {
        title: '观点详情',
        seoMeta: seoMeta,
        user: req.session.userInfo
      });
    } else {
      utils.errorHandler(res, data);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});


module.exports = router;
