/*
 * 账户管理
 * @Author: 大发
 */

var express = require('express'),
    session = require('express-session'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    crypto = require('crypto'),
    serverConfig = require('../../server_config'),
    appConfig = require('../../app_config'),
    _ = require('lodash');
    qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
    router = express.Router();

var hasher = crypto.createCipher('aes-128-ecb', '123');

/* 用户信息处理 */
function userInfoHandler(data) {
  var userData = data,
      userInfo = {};

  userInfo['userId'] = userData.sessionUserId; // 用户ID
  userInfo['nickname'] = userData.uName; // 昵称

  if(userData.uImg) {
    userInfo['avatar'] = userData.uImg; // 用户头像
  } else {
    if(userData.gender === 0) {
      userInfo['avatar'] = '/images/default_avatar_woman.jpg';
    } else {
      userInfo['avatar'] = '/images/default_avatar_man.jpg';
    }
  }

  if(userData.signature) {
    userInfo['signature'] = userData.signature; // 个性签名
  }

  if(userData.gender) {
    userInfo['gender'] = userData.gender; // 性别：女0，男1
  }

  userInfo['type'] = userData.uType; // 用户类型：游客0，小白1，投顾2
  userInfo['imId'] = userData.imId; // 环信ID
  userInfo['imToken'] = userData.imPwd; // 环信密码

  return userInfo;
}

/* 注册 */
router.post('/register', function(req, res) {
  var url = '/user_api/user_register';

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 登录 */
router.post('/login', function(req, res) {
  // 判断是否需要验证码
  var needCaptcha = utils.needCaptcha(req);

  if (needCaptcha) {
    // 验证验证码
    var captcha = req.body.params.captcha;
    var sCaptcha = req.session.captcha;

    if (!captcha || !sCaptcha || captcha.toLowerCase() !== req.session.captcha) {
      res.status(200).json({
        code: -1,
        message: '验证码错误'
      });
      return;
    }
  }

  var url = '/user_api/user_login'; // 接口地址

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    if(data.code === 0) {
      var userData = data.result;

      if(userData.uType === 2) {
        /* 如果是投顾，则登录成功 */
        var userId = new Buffer(userData.sessionUserId).toString('base64'),
            configKey = serverConfig.env[qiniuEnv].secretKey,
            secretKey = userId + configKey,
            cipher = crypto.createCipher('aes-128-ecb', secretKey),
            secretData = cipher.update(userData.sessionUserId, 'utf8', 'hex') + cipher.final('hex'),
            linkToken = secretData + ':' + userId,
            userInfo = userInfoHandler(userData);

        req.session.regenerate(function() {
          req.session.linkToken = linkToken;
          req.session.userToken = userData.sessionUserId;
          req.session.pwd = userData.pwd;
          req.session.userInfo = userInfo;
          req.session.save();
          res.status(200).json(data);
        });
      } else {
        /* 相反提示去APP操作 */
        res.status(200).json(data);
      }
    } else {

      // 登录失败，记录失败次数和过期时间
      if (req.session.loginErr) {
        req.session.loginErr += 1;
      } else {
        req.session.loginErr = 1;
      }
      var now = new Date().getTime();
      req.session.loginErrExpires = now + appConfig.session.loginErrExpire;

      // 失败了三次，第四次登录需要显示验证码
      if (req.session.loginErr === 3) {
        data = _.extend(data,{showCaptcha: true});
      }

      res.status(200).json(data);
    }
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 找回密码 */
router.post('/reset_password', utils.isLogged, function(req, res) {
  var url = '/user_api/user_back_pwd';

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 获取手机验证码 */
router.all('/get_captcha', function(req, res) {
  var url = '/user_api/reg_valcode';

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 验证账户 */
router.all('/valid_captcha', function(req, res) {
  var url = '/user_api/valid_captcha';

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

module.exports = router;
