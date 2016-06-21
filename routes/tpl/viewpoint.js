/*
 * 观点
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
 * 观点列表
 * @qiulijun
 */
router.get('/', function(req, res) {
  var stockUrl = '/mktinfo_api/fetch_stk_list',
      featuredVpUrl = '/adviser/fetch_adviser_note_list',
      hotVpUrl = '/adviser/fetch_viewpoint_list_by_type',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      adviserUrl = '/adviser/square_index', // 推荐投顾
      questionUrl = '/adviser/latest_qa_list', // 最新问答
      stockParams = {},
      featuredVpParams = {},
      hotVpParams = {},
      brokerParams = {},
      adviserParams = {},
      questionParams = {};

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 10;

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

  // 推荐投顾请求参数
  adviserParams['module'] = 'adviser';
  adviserParams['params'] = {};

  // 问答请求参数
  questionParams['module'] = 'adviser';
  questionParams['params'] = {};
  questionParams['params']['count'] = 3;

  // 转发请求
  ajax.map.post({
    url: stockUrl,
    body: stockParams
  }, {
    url: featuredVpUrl,
    body: featuredVpParams
  }, {
    url: hotVpUrl,
    body: hotVpParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }, {
    url: adviserUrl,
    body: adviserParams
  }, {
    url: questionUrl,
    body: questionParams
  }).then(function(datas) {
    var stockData = datas[0],
        featuredVpData = datas[1],
        hotVpData = datas[2],
        brokerData = datas[3],
        adviserData = datas[4],
        questionData = datas[5];

    if(stockData.code === 0 && featuredVpData.code === 0 && hotVpData.code === 0 && brokerData.code === 0 && adviserData.code === 0 && questionData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '观点直播，实时把握投资机会';

      seoMeta = utils.seoMeta('viewpoint', seoCustomMeta);

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

      res.render('viewpoint/seo_list', {
        featuredVps: featuredVpData.result.data,
        hotVps: hotVpData.result.data,
        widgetStocks: stockData.result.stks,
        widgetBrokers: brokerData.result.brokers,
        widgetRcmdAdviser: adviserData.result.niuRcmd,
        widgetQuestions: questionData.result.qa, // 最新问答
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
router.get('/:id', function(req, res) {
  var viewpoinrUrl = '/adviser/fetch_viewpoint_detail',
      stockUrl = '/mktinfo_api/fetch_stk_list',
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      adQuestionsUrl = '/adviser/adviser_square_qa', //投顾的问答
      adViewpointsUrl = '/adviser/fetch_viewpoint_list', //投顾的观点
      adInformationUrl = '/user_api/fetch_user_info', //投顾的信息
      params = {},
      stockParams = {},
      brokerParams = {};

  params['module'] = 'adviser';
  params['params'] = {};
  params['params']['viewpointId'] = req.params.id;

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 5;

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
        url: stockUrl,
        body: stockParams
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
              seoCustomDescription = viewpointDetail.content;

          seoCustomDescription = seoCustomDescription.replace('/<[^>]+>/', '');

          seoCustomMeta['title'] = viewpointDetail.title + '_观点_一起牛';
          seoCustomMeta['keywords'] = viewpointDetail.title;
          seoCustomMeta['description'] = seoCustomDescription.substring(0, 99);
          seoCustomMeta['mixins'] = 1;

          seoMeta = utils.seoMeta('viewpoint', seoCustomMeta);

          var shareUrl, qiniuEnv, adviserInfo;
          adviserInfo = datas[4].result;
          qiniuEnv = process.env.NODE_ENV; // 当前的项目环境
          shareUrl = serverConfig.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;
          adviserInfo.thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + viewpointDetail.uId;

          res.render('viewpoint/seo_info', {
            id: req.params.id,
            data: viewpointDetail,
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
