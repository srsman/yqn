/*
 * 静态页面
 * @qiulijun
 */

var express = require('express'),
    moment = require('moment'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    seoMeta = utils.seoMeta(),
    router = express.Router();

/* 招贤纳士 */
router.get('/gongzuo', function(req, res) {
  seoMeta = utils.seoMeta('jobs');

  res.render('static/jobs', {
    seoMeta: seoMeta,
    user: req.session.userInfo // 用户Session信息
  });
});

/* 合作平台 */
router.get('/hezuo', function(req, res) {
  seoMeta = utils.seoMeta('cooperation');

  res.render('static/cooperation', {
    seoMeta: seoMeta,
    user: req.session.userInfo // 用户Session信息
  });
});

/* 下载APP */
router.get('/xiazai', function(req, res) {
  seoMeta = utils.seoMeta('download');

  res.render('static/download', {
    seoMeta: seoMeta,
    user: req.session.userInfo // 用户Session信息
  });
});

/* 关于我们 */
router.get('/guanyu', function(req, res) {
  seoMeta = utils.seoMeta('aboutUs');

  res.render('static/aboutus', {
    seoMeta: seoMeta,
    user: req.session.userInfo // 用户Session信息
  });
});

/* 申请认证为投顾的引导页 */
router.get('/renzhen', function(req, res) {
  seoMeta = utils.seoMeta('certification');

  res.render('static/certification', {
    seoMeta: seoMeta,
    user: req.session.userInfo // 用户Session信息
  });
});

module.exports = router;
