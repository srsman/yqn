/**
 * Created by ayou on 2016/1/23.
 */
var express = require('express'),
  path = require('path'),
  router = express.Router();

/* 首页 */
router.get('/', function(req, res, next) {
  res.render('mobile/index');
});
/* 下载 */
router.get('/download', function(req, res, next) {
  res.render('mobile/download');
});
/* 合作 */
router.get('/cooperation', function(req, res, next) {
  res.render('mobile/cooperation');
});
/* 招聘 */
router.get('/jobs', function(req, res, next) {
  res.render('mobile/jobs');
});
/* 我们 */
router.get('/about_us', function(req, res, next) {
  res.render('mobile/about_us');
});

module.exports = router;