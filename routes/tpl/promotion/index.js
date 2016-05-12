/**
 * 活动
 * Created by ayou on 2016-03-18.
 */
var express = require('express'),
      router = express.Router();

/*官网推广活动 */
router.get('/xiazai', function(req, res, next) {
      res.render('promotion/download');
});
module.exports = router;