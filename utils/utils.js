/*
 * 工具类
 * @Author: 大发
 */

var utils = module.exports = {},
    fs = require('fs'),
    path = require('path'),
    appConfig = require('../app_config');


/**
 * 判断当前登录是否需要验证码
 * @param req
 * @returns {number}
 */
utils.needCaptcha = function(req) {
  var needCaptcha = false;
  // 判断登录错误是否过期
  var loginErrExpire = req.session.loginErrExpire;
  var now = new Date().getTime();

  // 如果session不存在或已过期
  if (!loginErrExpire || now > loginErrExpire) {
    req.session.loginErrExpire = now + appConfig.session.loginErrExpire;
    req.session.loginErr = 0;
  } else {
    // 登录错误的次数
    var loginErr = req.session.loginErr;
    if (loginErr && loginErr >= 3) {
      needCaptcha = true;
    }
  }
  return needCaptcha;
};

/*
 * SEO网页meta处理
 * @module: 调用模块（String）
 * @custom: 模块自定义信息（Object）
 * * @title: 自定义title
 * * @keywords: 自定义关键字
 * * @description: 自定义描述
 * * @mixins: 是否与该模块的基本SEO信息混合，0为混合，1为不混合，不传则为0
 */
utils.seoMeta = function(module, custom) {
  var seoInfo = {};

  seoInfo['title'] = appConfig.seo.default.title;
  seoInfo['keywords'] = appConfig.seo.default.keywords;
  seoInfo['description'] = appConfig.seo.default.description;

  // 如果没传模块就直接返回默认的
  if(typeof module === 'string') {
    if(appConfig.seo[module] !== undefined) {
      if(custom !== undefined) {
        if(custom.mixins === 1) {
          /* 不混合 */
          seoInfo['title'] = custom.title !== undefined ? custom.title : appConfig.seo[module].title;

          seoInfo['keywords'] = custom.keywords !== undefined ? custom.keywords : appConfig.seo[module].keywords;

          seoInfo['description'] = custom.description !== undefined ? custom.description : appConfig.seo[module].description;
        } else {
          /* 混合 */
          seoInfo['title'] = custom.title !== undefined ? custom.title + ' - ' + appConfig.seo[module].title : appConfig.seo[module].title;

          seoInfo['keywords'] = custom.keywords !== undefined ? custom.keywords + '，' + appConfig.seo[module].keywords : appConfig.seo[module].keywords;

          seoInfo['description'] = custom.description !== undefined ? custom.description + ' - ' + appConfig.seo[module].description : appConfig.seo[module].description;
        }
      } else {
        seoInfo['title'] = appConfig.seo[module].title;
        seoInfo['keywords'] = appConfig.seo[module].keywords;
        seoInfo['description'] = appConfig.seo[module].description;
      }
    }
  }

  return seoInfo;
};

// 过滤会话
utils.session = function(req, res, next) {
  if(typeof req.session.userToken === 'undefined' || !req.session.userToken) {
    res.redirect('/denglu');
    return false;
  } else {
    next();
  }
};

// 认证用户
utils.authUser = function(req, res, data) {
  if(req.session.userToken) {
    data['userToken'] = req.session.linkToken;
    // data['userToken'] = req.session.userToken;
    data['id'] = utils.onlyNum(); //增加请求唯一ID

    return data;
  } else {
    res.redirect('/denglu');
  }
};

// 添加请求来源
utils.addSrc = function(data) {
  data['src'] = 'PC';

  return data;
};

// 登录了则无法进入登录注册页面
utils.isLogged = function(req, res, next) {
  if(req.session.userToken && req.session.userToken !== null) {
    res.redirect('/question/square');
  } else {
    next();
  }
};

// 错误处理
utils.errorHandler = function(res, data) {
  res.render('error/error', {
    message: data.message,
    error: {}
  });
};

// 404
utils.noPageHandler = function(res) {
  res.status(404).render('error/error_404');
};

// 计算时间差
utils.timeDifference = function(timestamps) {
  timestamps = Number(timestamps);

  function formatNum(num) {
    num = Number(num);
    if(num < 10) {
      num = '0' + num;
    }
    return num;
  }

  var originalTime = new Date(timestamps),
      currentTime = (new Date()).getTime(),
      interval = currentTime - timestamps,
      days,
      hours,
      minutes,
      seconds,
      timeHtml = '';

  days = Math.floor(interval / (24 * 3600 * 1000)); //相差天数
  hours = Math.floor(interval / (3600 * 1000)); //相差小时数
  minutes = Math.floor(interval / (60 * 1000)); //相差分钟
  seconds = Math.floor(interval / 1000); //相差秒数

  var adjustedYear = originalTime.getFullYear(),
      adjustedMonth = formatNum(originalTime.getMonth() + 1),
      adjustedDate = formatNum(originalTime.getDate()),
      adjustedHours = formatNum(originalTime.getHours()),
      adjustedMinutes = formatNum(originalTime.getMinutes()),
      adjustedSeconds = formatNum(originalTime.getSeconds());

  var nowTime = new Date();

  if(originalTime.getFullYear() === nowTime.getFullYear() && originalTime.getMonth() === nowTime.getMonth() && originalTime.getDate() === nowTime.getDate()) {
    if(seconds < 60) {
      timeHtml = '刚刚';
    } else if (minutes < 60) {
      timeHtml = minutes + '分钟前';
    } else {
      timeHtml = '今天 ' +
              adjustedHours + ':' +
              adjustedMinutes;
    }
  } else if(originalTime.getFullYear() === nowTime.getFullYear() && originalTime.getMonth() === nowTime.getMonth() && originalTime.getDate() === (nowTime.getDate() - 1)) {
    timeHtml = '昨天 ' +
            adjustedHours + ':' +
            adjustedMinutes;
  } else {
    var yearHtml = '';

    if(adjustedYear !== (new Date()).getFullYear()) {
      yearHtml = adjustedYear + '年';
    }

    timeHtml += yearHtml +
            adjustedMonth + '月' +
            adjustedDate + '日 ' +
            adjustedHours + ':' +
            adjustedMinutes;
  }

  return timeHtml;
};

/* 批量处理时间数据
 * #qiulijun
 * @param {arr} 时间数组(必填)
 * @param {string} 关键字(必填)
 * @return {array}
 */
utils.batchHandleTs = function(arr, keyword) {

  var isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  if( !isArray(arr) ) {
    return [];
  }

  if(typeof keyword !== 'string') {
    return [];
  }

  var length = arr.length;

  for(var i = 0; i < length; i++) {
    arr[i][keyword] = utils.timeDifference(arr[i][keyword]);
  }

  return arr;
};

// 格式化时间
utils.formatDate = function(timestamps, fmtype) {
  timestamps = Number(timestamps);

  var date = new Date(timestamps),
      obj = {
        'M+': date.getMonth() + 1, //月份
        'd+': date.getDate(), //日
        'h+': date.getHours(), //小时
        'm+': date.getMinutes(), //分
        's+': date.getSeconds(), //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        'S': date.getMilliseconds() //毫秒
      };

  if(/(y+)/.test(fmtype)) {
    fmtype = fmtype.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for(var k in obj) {
    if(new RegExp('(' + k + ')').test(fmtype)) {
      fmtype = fmtype.replace(RegExp.$1, (RegExp.$1.length === 1) ? (obj[k]) : (('00' + obj[k]).substr(('' + obj[k]).length)));
    }
  }

  return fmtype;
};

// 默认头像
utils.checkUserIcon = function(icon, gender) {
  if(icon) {
    return icon;
  } else {
    if(parseInt(gender) === 1) {
      return '/images/default_avatar_man.jpg';
    } else {
      return '/images/default_avatar_woman.jpg';
    }
  }
};

// 生成唯一数
utils.onlyNum = function() {
  var num = '',
      timestamp = '',
      randomNum = '';

  // 获取当前时间的时间戳
  timestamp = (new Date()).valueOf();

  // 随机数
  for(var r = 0; r < 6; r++) {
    randomNum += Math.floor(Math.random() * 10);
  }

  num = timestamp + randomNum;
  return num;
};

/*
 * 保留数字2位小数
 * @num: 需要格式化的数字
 * @range: 是否加入涨跌幅的html
 */
utils.formatNum = function(num, range) {
  /* 将传入值转为浮点数，如果不是数字类型，则直接返回该传入值 */
  var f_x = parseFloat(num);

  if(isNaN(f_x)) {
    return num;
  }

  // 取到该数字的小数点后两位
  f_x = Math.floor(num * 100) / 100;

  var s_x = f_x.toString(),
      pos_decimal = s_x.indexOf('.');

  if(pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += '.';
  }

  while(s_x.length <= pos_decimal + 2) {
    s_x += '0';
  }

  // 是否加入涨跌html标签
  if(range === 1) {
    // 涨
    s_x = '<i class="qn-stock-price up">' + s_x + '</i>';
  } else if(range === 2) {
    // 跌
    s_x = '<i class="qn-stock-price down">' + s_x + '</i>';
  } else if(range === 3) {
    // 不涨不跌
    s_x = '<i class="qn-stock-price">' + s_x + '</i>';
  }

  return s_x;
};

// 格式化百分比
utils.formatPct = function(num, tpl) {
  /* 将传入值转为浮点数，如果不是数字类型，则直接返回该传入值 */
  var f_x = parseFloat(num);

  if(isNaN(f_x)) {
    return num;
  }

  f_x = f_x * 100;

  var s_x = parseFloat(utils.formatNum(f_x)),
      s_x_tpl = utils.formatNumVal(s_x, 1);

  if(tpl === 1) {
    if(s_x > 0) {
      // 涨
      s_x = '<i class="qn-stock-price up">+' + s_x_tpl + '%</i>';
    } else if(s_x < 0) {
      // 跌
      s_x = '<i class="qn-stock-price down">' + s_x_tpl + '%</i>';
    } else {
      // 不涨不跌
      s_x = '<i class="qn-stock-price">' + s_x_tpl + '%</i>';
    }
  } else {
    if(s_x > 0) {
      // 涨
      s_x = '+' + s_x_tpl + '%';
    } else {
      // 跌或者不涨不跌
      s_x = s_x_tpl + '%';
    }
  }

  return s_x;
};

/*
 * 判断是否为数字
 * @num: 需要判断的数字
 */
// utils.isNum = function(num) {
//   var formatNum = parseFloat(num);

//   if(isNaN(formatNum)) {
//     return num;
//   }

//   return formatNum;
// };

/*
 * 格式化数值
 * @num: 需要格式化的数值
 * @type: 需要进行哪种格式化
 * * @1: 保留两位小数
 * * @2: 格式化百分数，并且保留2位小数
 * * @3: 格式化数字为中文
 */
utils.formatNumVal = function(num, type) {
  var formatNum = parseFloat(num);

  if(isNaN(formatNum)) {
    return num;
  }

  switch(type) {
    case 1:
      formatNum = utils.formatNumDecimal(num);
      break;
    case 2:
      formatNum = utils.formatNumDecimal(formatNum * 100);
      break;
    case 3:
      var yi = 100000000, // 亿
          wan = 10000; // 万

      if(Math.abs((num / yi) >= 1)) {
        formatNum = utils.formatNumDecimal(num / yi) + '亿';
      } else if(Math.abs((num / wan) >= 1)) {
        formatNum = utils.formatNumDecimal(num / wan) + '万';
      } else {
        formatNum = utils.formatNumDecimal(num);
      }

      break;
    default:
      formatNum = num;
  }

  return formatNum;
};

/*
 * 格式化数字小数点
 * @num: 需要格式化的数字
 * @keepNum: 保留的位数，默认保留两位
 */
utils.formatNumDecimal = function(num, keepNum) {
  var sNum = parseFloat(num);

  if(isNaN(sNum)) {
    return num;
  } else {
    sNum = num.toString();
  }

  keepNum = keepNum || 2;
  var decimalIndex = sNum.indexOf('.');

  if(decimalIndex < 0) {
    decimalIndex = sNum.length;
    sNum += '.';
  } else {
    sNum = sNum.substring(0, decimalIndex + keepNum + 1);
  }

  // 补零
  while(sNum.length <= decimalIndex + keepNum) {
    sNum += '0';
  }

  return sNum;
};

/*
 * 格式化涨跌幅
 * @num: 需要格式化的数字
 * @type: 需要进行哪种格式化
 * * @1: 格式化涨跌幅
 * * @2: 格式化涨跌幅（带百分号）
 * @refer: 参考值
 */
utils.formatChange = function(num, type, refer) {
  var formatNum = parseFloat(num);

  if(isNaN(formatNum)) {
    return num;
  }

  switch(type) {
    case 1:
      formatNum = utils.formatNumVal(formatNum, 2);
      break;
    case 2:
      formatNum = utils.formatNumVal(formatNum, 2);
      break;
  }

  return formatNum;
};

/**
 * 递归创建路径，同步
 * @param dirname 文件路径
 * @param mode 文件属性，默认为0777
 */
utils.mkdirsSync = function (dirname, mode) {
  function mkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (mkdirsSync(path.dirname(dirname), mode)) {
        fs.mkdirSync(dirname, mode);
        return true;
      }
    }
  }

  mkdirsSync(dirname, mode);
};

/*
 * 截取纯文本的固定字数
 */
utils.limitText = function(text, num) {
  var newText;

  if (num === undefined) {
    num = 50;
  }

  if (text.length > num) {
    newText = text.substring(0, num) + '…';
  } else {
    newText = text;
  }

  return newText;
};

/*
 * 股票详情地址转换
 * 说明：转换股票详情地址（app—转pc）
 * @text：文本内容
 */
utils.formatStkUrl = function(text){
  var reg = /href="\s*http\:\/\/localstock\.yiqiniu\.com[^"]+assetid=(\d{6}\.[A-Z]{3}\.[A-Z]{2}|\d{6}\.[A-Z]{2})[^"]*"/ig;
  return text.replace(reg, 'href="/gupiao/$1"');
};

// 过滤script脚本
String.prototype.strFilter = function() {
  return this.replace(/<script>/g,"&lt;script&gt;").replace(/<\/script>/g,"&lt;/script&gt;");
};

/*
 * 没有考虑emoji的截断问题
 */
String.prototype.niuStrSub = function(len){
  // 先将&nbsp;转为" "再截断，再转回来
  var tmp = '';
  tmp = this.replace(/&nbsp;/g," ");
  if(tmp.length > len){
    return tmp.substr(0,len).replace(/ /g,"&nbsp;") + "...";
  }else{
    return tmp.replace(/ /g,"&nbsp;");
  }
};

