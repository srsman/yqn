var express = require('express'),
    ajax = require('../utils/ajax'),
    utils = require('../utils/utils'),
    log4js = require('log4js'),
    fs = require('fs'),
    router = express.Router();

var routerLog = log4js.getLogger('router');

/*
* 广场问答
* qinxingjun
*/
router.route('/square')
.get(utils.session, function(req, res, next) {

  var url = '/adviser/answer_qa_list',
      params = {};

  params['params'] = {};
  params = utils.authUser(req, res, params);
  params['params']['type'] = 1;
  params['params']['count'] = 10;

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {

    if(data.code === 0){
      if(data.result && data.result.qa){
        var qa = data.result.qa;

        for(var i=0; i<qa.length; i++){

          //格式化日期
          qa[i].qTime = utils.timeDifference(qa[i].qTime);
          qa[i].aTime = utils.timeDifference(qa[i].aTime);

          if(qa[i].timeLimit){
            qa[i].timeLimit = utils.formatDate(qa[i].timeLimit, 'hh:mm');
          }

          //头像处理
          qa[i].qIcon = utils.checkUserIcon(qa[i].qIcon,qa[i].qGender);

          //过滤script脚本
          qa[i].qContent = qa[i].qContent.strFilter();

          if(qa[i].aContent){
            qa[i].aContent = qa[i].aContent.strFilter();
          }
        }
      }

      res.render('question/square', {
        title: '广场问答',
        data: data,
        user: req.session.userInfo
      });
    } else{
      utils.errorHandler(res, data);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 客户问答
* qinxingjun
*/
router.route('/exclusive')
.get(utils.session, function(req, res, next) {

  var url = '/adviser/answer_qa_list',
      params = {};

  params['params'] = {};
  params = utils.authUser(req, res, params);
  params['params']['type'] = 2;
  params['params']['count'] = 10;

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {

    if(data.code === 0){
      if(typeof data.result !== "undefined" && typeof data.result.qa !== "undefined"){

        var qa = data.result.qa;
        for(var i=0; i<qa.length; i++){

          //格式化日期
          qa[i].qTime = utils.timeDifference(qa[i].qTime);
          qa[i].aTime = utils.timeDifference(qa[i].aTime);

          if(qa[i].timeLimit){
            qa[i].timeLimit = utils.formatDate(qa[i].timeLimit, 'mm:ss');
          }

          //头像处理
          qa[i].qIcon = utils.checkUserIcon(qa[i].qIcon,qa[i].qGender);

          //过滤script脚本
          qa[i].qContent = qa[i].qContent.strFilter();

          if(qa[i].aContent){
            qa[i].aContent = qa[i].aContent.strFilter();
          }
        }
      }
      res.render('question/exclusive', {
        title: '客户问答',
        data: data,
        user: req.session.userInfo
      });
    } else{
      utils.errorHandler(res, data);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 广场问答、客户问答增量接口
* qinxingjun
*/
router.route('/question_list')
.post(utils.session, function(req, res) {

  var url = '/adviser/answer_qa_list',
      params = {};

  params['params'] = req.body;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 抢答、拒绝、回答、放弃
* qinxingjun
*/
router.route('/answer_action')
.post(utils.session, function(req, res) {

  var url = '/adviser/answer_action',
      params = {};

  params['params'] = req.body;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 获取广场问答开关值
* qinxingjun
*/
router.post('/get_adviser_switch', utils.session, function(req, res) {

  var url = '/adviser/get_adviser_switch',
      params = {};

  params['params'] = req.body;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 设置广场问答开关值
* qinxingjun
*/
router.post('/set_adviser_switch', utils.session, function(req, res) {

  var url = '/adviser/set_adviser_switch',
      params = {};

  params['params'] = req.body;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 获取统计数据
* qinxingjun
*/
router.post('/qa_statistic_data', utils.session, function(req, res) {

  var url = '/adviser/qa_statistic_data',
      params = {};

  params['params'] = req.body;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

//抛出
module.exports = router;