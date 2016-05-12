var express = require('express'),
  utils = require('../utils/utils'),
  router = express.Router();



/**
 * 用户注册协议
 */
router.route('/user')
.get(utils.isLogged, function(req, res, next) {
    console.log('this is test');
    res.render('protocols/user',{
      title: '用户协议'
    });
});





module.exports = router;