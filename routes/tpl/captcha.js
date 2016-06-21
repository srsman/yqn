/**
 * 验证码
 * Created by ayou on 2016-05-17.
 */
var express = require('express'),
  ccap = require('../../utils/ccap'),
  os = require('os'),
  router = express.Router();

/**
 * 获取验证码
 */
router.get('/', function(req, res, next) {
  var captcha = ccap({
    width:160,
    generate:function(){
      // 随机字符串
      return function (len) {
        len = len || 32;
        //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = $chars.length;
        var str = '';
        for (var i = 0; i < len; i++) {
          str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
      }(4);
    }
  });
  var ary = captcha.get();
  var text = ary[0];
  var buffer = ary[1];
  req.session.captcha = text.toLowerCase();
  var isjpeg = (os.platform() == 'linux')? 1 : 0;//判断是否启用jpeg,如果是为win32则只能使用bmp
  if (isjpeg) {
    res.set('Content-Type', 'image/jpeg');
  } else {
    res.set('Content-Type', 'image/bmp');
  }
  res.end(buffer);
});

module.exports = router;