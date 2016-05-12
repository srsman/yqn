/*
 * 公共模块
 * @Author: 大发
 */

var express = require('express'),
    moment =require('moment'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    seoMeta = utils.seoMeta(),
    config = require('../../yiqiniu_config'),
    path = require('path'),
    router = express.Router();

/* 首页 */
router.get('/', function(req, res, next) {
  var stockUrl = '/mktinfo_api/fetch_stk_list', // 热门股票
      viewpointUrl = '/adviser/fetch_adviser_note_list', // 精选观点
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      newsUrl = '/mktinfo_api/fetch_news_index', // 热点新闻
      questionUrl = '/adviser/latest_qa_list', // 最新问答
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      portfolioUrl = '/ptf_api/fetch_ptf', // 投资组合
      adviserUrl = '/adviser/square_index', // 推荐投顾
      stockParams = {},
      viewpointParams = {},
      newStockParams = {},
      newsParams = {},
      questionParams = {},
      brokerParams = {},
      portfolioParams = {},
      adviserParams = {};

  // 股票请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 10;

  // 观点请求参数
  viewpointParams['module'] = 'adviser';
  viewpointParams['params'] = {};
  viewpointParams['params']['count'] = 5;
  viewpointParams['params']['readId'] = 0;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 新闻请求参数
  newsParams['module'] = 'market';
  newsParams['params'] = {};
  newsParams['params']['type'] = 6;
  newsParams['params']['count'] = 5;

  // 问答请求参数
  questionParams['module'] = 'adviser';
  questionParams['params'] = {};
  questionParams['params']['count'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 投资组合请求参数
  portfolioParams['module'] = 'portfolio';
  portfolioParams['params'] = {};
  portfolioParams['params']['type'] = 'G';
  portfolioParams['params']['action'] = 0;
  portfolioParams['params']['sort'] = 1;
  portfolioParams['params']['sortDir'] = 'D';
  portfolioParams['params']['count'] = 4;
  //portfolioParams['params']['flag'] = 1 << 0 | 1 << 1 | 1 << 2 | 1 << 5 | 1 << 7 | 1 << 19 | 1 << 20 | 1 << 21 | 1 << 23 | 1 << 38 | 1 << 39;
  portfolioParams['params']['flag'] = 824645779623;
  portfolioParams['params']['isReal'] = 'A';
  portfolioParams['params']['userId'] = 0;

  // 推荐投顾请求参数
  adviserParams['module'] = 'adviser';
  adviserParams['params'] = {};

  // 转发请求
  ajax.map.post({
    url: stockUrl,
    body: stockParams
  }, {
    url: viewpointUrl,
    body: viewpointParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: newsUrl,
    body: newsParams
  }, {
    url: questionUrl,
    body: questionParams
  }, {
    url: portfolioUrl,
    body: portfolioParams
  }, {
    url: adviserUrl,
    body: adviserParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stocksData = datas[0],
        viewpointsData = datas[1],
        newStockData = datas[2],
        newsData = datas[3],
        questionData = datas[4],
        portfolioData = datas[5],
        adviserData = datas[6],
        brokerData = datas[7];

    if(stocksData.code === 0 && viewpointsData.code === 0 && newStockData.code === 0 && newsData.code === 0 && questionData.code === 0 && portfolioData.code === 0 && adviserData.code === 0 && brokerData.code === 0) {

      // 提问二维码生成链接解析
      if(adviserData.result.niuRcmd) {
        for(var i = 0; i < adviserData.result.niuRcmd.length; i++) {
          var item = adviserData.result.niuRcmd[i],
              thisUid = item.uId,
              thisUrl,
              qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = config.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + thisUid;

          adviserData.result.niuRcmd[i]['shareUrl'] = thisUrl;
        }
      } else {
        adviserData.result.niuRcmd = {};
      }

      res.render('utils/home', {
        overview: adviserData.result, // 首页总览信息
        adviser: adviserData.result.niuRcmd, // 推荐投顾
        portfolio: portfolioData.result.ptfs, // 投资组合
        viewpoints: viewpointsData.result.data, // 精选观点
        questions: questionData.result.qa, // 最新问答
        widgetStocks: stocksData.result.stks, // 热门股票
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetNews: newsData.result.data, // 热点新闻
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        user: req.session.userInfo, // 用户Session信息
        moment: moment, // 格式化时间中间件
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 注册 */
router.get('/zhuce', utils.isLogged, function(req, res, next) {
  seoMeta = utils.seoMeta('account');

  res.render('accounts/register', {
    seoMeta: seoMeta
  });
});

/* 登录 */
router.get('/denglu', utils.isLogged, function(req, res, next) {
  seoMeta = utils.seoMeta('account');

  res.render('accounts/login', {
    seoMeta: seoMeta
  });
});

/* 找回密码 */
router.get('/zhaohuimima', utils.isLogged, function(req, res, next) {
  seoMeta = utils.seoMeta('account');

  res.render('accounts/reset_password', {
    seoMeta: seoMeta
  });
});

/* 注销 */
router.get('/zhuxiao', function(req, res, next) {
  // 删除浏览器cookie
  res.clearCookie('connect.sid', {maxAge: 0});
  res.redirect('/denglu');
  //req.session.regenerate(function() {
  //  req.session.userToken = null;
  //  req.session.userInfo = null;
  //  req.session.save();
  //  res.redirect('/accounts/login');
  //});
});

/* 监控服务 */
router.all('/monitor', function(req, res, next) {
  res.status(200).json({'normal': true});
});

/* 只在开发和测试环境下可以通过浏览器访问 */
if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  /* 公共元素文档 */
  router.get('/common_element', function(req, res, next) {
    res.render('utils/common_element', {
      title: '公共元素文档',
      user: req.session.userInfo
    });
  });

  /* 查看日志 */
  router.get('/log/:name', function(req, res) {
    var options = {
      root: path.join(__dirname, '../../logs/'),
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };

    var fileName = req.params.name;

    res.sendFile(fileName, options, function(err) {
      if(err) {
        res.status(err.status).json(err);
      }
    });
  });
}

module.exports = router;
