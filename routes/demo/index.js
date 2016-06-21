/*
 * 公共Demo
 * @Author: 大发
 */

var express = require('express'),
    router = express.Router();

/* 公共Table */
router.get('/table', function(req, res) {
  res.render('demo/table', {
    demoTitle: '公用Table演示'
  });
});

module.exports = router;
