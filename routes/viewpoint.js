var express = require('express'),
    ajax = require('../utils/ajax'),
    utils = require('../utils/utils'),
    uploader = require('../utils/uploaderJava'),
    log4js = require('log4js'),
    fs = require('fs'),
    path = require('path'),
    router = express.Router();

/*
* 观点列表
* qinxingjun
*/
router.route('/list')
.get(utils.session, function(req, res, next) {

  var url = '/adviser/fetch_viewpoint_list', // 接口地址
      summaryLen = 137,//摘要长度
      params = {};

  params['params'] = {};
  params = utils.authUser(req, res, params);
  params['params']['count'] = 10;
  params['params']['readId'] = 0;
  params['params']['uId'] = req.session.userToken;

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {

    if(data.code === 0){
      var data2Front = null;
      if(data.result && data.result.data ){
        // 临时变量，用于格式化日期
        var _data = data.result.data;
        // 传递给前台的变量
        if( typeof _data === 'undefined'){
          data2Front = [];
        }else{
          for(var i=0; i<_data.length; i++){
            // 格式化日期
            _data[i].viewpointTs = utils.timeDifference(_data[i].viewpointTs);
             // 截断摘要,摘要可能为空
            var summary = '';
            summary = typeof _data[i].summary === "undefined" ? "" : _data[i].summary;
            _data[i].summary = summary.niuStrSub(summaryLen);
          }
          data2Front = data;
        }
      }
      res.render('viewpoint/list', {
        title: '观点',
        data: data2Front,
        user: req.session.userInfo
      });
    } else{
      utils.errorHandler(res, data);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
}).post(utils.session, function(req, res) { //拉取最新
  var url = '/adviser/fetch_viewpoint_list', // 接口地址
      params = {};

  params['params'] = req.body;
  params['params']['uId'] = req.session.userToken;
  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {

    if(data.code === 0 && ( typeof data.result !== 'undefined') ){

      // 临时变量，用于格式化日期
      var _data = data.result.data;
      // 传递给前台的变量
      var data2Front = null;

      if( typeof _data === 'undefined'){
        data2Front = [];
      }else{
        for(var i=0; i<_data.length; i++){
          //格式化日期
          _data[i].viewpointTs = utils.timeDifference(_data[i].viewpointTs);
        }
        data2Front = data;
      }
      res.status(200).json(data2Front);
    } else{
      utils.errorHandler(res, data);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 观点详情
* qinxingjun
* 说明：是否加精"从接口来，需要改接口
*/
router.route('/detail/:id')
.get(utils.session, function(req, res, next) {

  var url = '/adviser/fetch_viewpoint_detail',
      params = {};

  params['params'] = {};
  params = utils.authUser(req, res, params);
  params['params']['viewpointId'] = req.params.id;

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    if (data.code === 0 && data.result !== 'undefined') {

      // 如果查看的是其他人的
      if (data.result.uId !== req.session.userToken) {
        res.render('viewpoint/no_result',{
          title: '观点详情',
          user: req.session.userInfo
        });
      }

      //格式化日期
      data.result.viewpointTs = utils.timeDifference(data.result.viewpointTs);
      //是否精选
      //data.result.isSelection = req.params.isSelection;
      res.render('viewpoint/detail', {
        id: req.params.id,
        title: '观点详情',
        data: data,
        user: req.session.userInfo,
        utils:utils
      });
    } else if (data.code === 10016) {
      //该观点不存在或已经删除
      res.render('viewpoint/no_result',{
        title: '观点详情',
        user: req.session.userInfo
      });
    } else {
      utils.errorHandler(res, data);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
* 新观点
* qinxingjun
*/
router.route('/new')
.get(utils.session, function(req, res, next) {
  res.render('viewpoint/new', {user: req.session.userInfo});
}).post(utils.session, function(req, res) {

  var url = '/adviser/save_adviser_viewpoint',
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
 * 观点删除
 * Ayou
 */
router.route('/delete')
.post(utils.session, function(req,res) {

  var url = '/adviser/delete_viewpoint_interaction',
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
 * 获取评论
 * Ayou
 */
router.route('/comments')
.post(utils.session, function(req,res) {

  var url = '/adviser/fetch_viewpoint_comments',
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
 * 点赞列表
 * Ayou
 */
router.route('/like_list')
.post(utils.session, function(req,res) {

  var url = '/adviser/fetch_viewpoint_likes',
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
* 评论、点赞
* qinxingjun
*/
router.route('/save_interaction')
.post(utils.session, function(req, res) {

  var url = '/adviser/save_viewpoint_interaction',
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

/**
 * 观点统计
 * ayou
 */
router.route('/statistic')
.post(utils.session,function(req, res) {
  var url = '/adviser/fetch_viewpoint_num',
    params = {};

  params['params'] = req.body;
  params['params']['uId'] = req.session.userToken;
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

/**
 * 搜索股票
 * qinxingjun
 */
router.route('/search_stk')
.post(utils.session,function(req, res) {
  var url = '/mktinfo_api/search_stk_cct',
    params = {};

  params['params'] = req.body;
  params['params']['uId'] = req.session.userToken;
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

/**
 * 上传图片,调用java接口
 */
router.route('/upload')
.post(utils.session, function(req, res, next) {
  //生成临时目录
  var tmpDir = './tmp/';
  mkdirsSync(tmpDir,0777);
  //上传图片
  uploader.upload(req,res,tmpDir);
});


///**
// * 上传图片，node版
// */
//var flag = null;
//router.route('/upload')
//  .post(utils.session, function(req, res, next) {
//
//    //生成临时目录
//    var tmpDir = './tmp/';
//    mkdirsSync(tmpDir,0777);
//
//    // 根据日期生成上传路径
//    var date = new Date();
//    var year = date.getFullYear();
//    var month = date.getMonth() + 1;
//    var day = date.getDate();
//    var datePath = year + '/' + month + '/' + day + '/';
//    imgUploadPath = imgUploadPath.substr(imgUploadPath.length-1,1) === '/' ? imgUploadPath : imgUploadPath + '/';
//    var dstPath = imgUploadPath + datePath;
//    mkdirsSync(dstPath,0777);
//    //res.send(req.files);
//    uploaderJava.upload(req,res);
//    //uploader.upload(req,res,tmpDir,dstPath,datePath);
//    //flag = uploader.upload(req,res,tmpDir,dstPath,datePath);
//    //next();
// });
//
///**
// * 上传图片进度
// */
//router.route('/uploadPrg')
//  .get(utils.session, function(req, res) {
//    if(uploader.progress[req.session.linkToken]){
//      res.send({'value':uploader.progress[req.session.linkToken]});
//      if(uploader.progress[req.session.linkToken] === 100) {
//        delete(uploader.progress[req.session.linkToken]);
//      }
//    }else{
//      res.send({'value':0});
//    }
//});


//递归创建目录 同步方法
function mkdirsSync(dirname, mode){
  if(fs.existsSync(dirname)){
    return true;
  }else{
    if(mkdirsSync(path.dirname(dirname), mode)){
      fs.mkdirSync(dirname, mode);
      return true;
    }
  }
}

//抛出
module.exports = router;
