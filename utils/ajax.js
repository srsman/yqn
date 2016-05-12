/*
 * 请求转发工具
 * @Author: 大发
 */

var ajax = module.exports = {},
    _ = require('lodash'),
    when = require('when'),
    keys = require('when/keys'),
    request = require('request'),
    log4js = require('log4js'),
    config = require('../yiqiniu_config'),
    utils = require('../utils/utils'),
    qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
    urlPrefix = config.env[qiniuEnv].target, // 当前项目环境的转发地址
    slice = Array.prototype.slice;

var requestLog = log4js.getLogger('request');

/*
 * @param url [string | object] 请求地址(必填)
 * @param options [object] 请求参数，第一个参数为对象时可以不传(选填)
 */
var _request = ajax.request = function(url, options) {
  options = options || {};

  options.method = (options.method || 'GET').toUpperCase();

  options.strictSSL = config.env[qiniuEnv].strictSSL;

  if(options.req) {
    // 只保留req中的headers部分与body部分
    options.headers = _.extend({}, options.req.headers);
    options.body = _.extend({}, options.req.body);

    delete options.req;
  }

  if(options.method === 'POST' && !options.json) {
    options.json = true;
  }

  var deferred = when.defer();

  // 判断请求模块
  var requestModule = options.body.module,
      moduleUrl;

  switch(requestModule) {
    case 'user':
      moduleUrl = urlPrefix.user;
      break;
    case 'market':
      moduleUrl = urlPrefix.market;
      break;
    case 'portfolio':
      moduleUrl = urlPrefix.portfolio;
      break;
    case 'h5':
      moduleUrl = urlPrefix.h5;
      break;
    case 'im':
      moduleUrl = urlPrefix.im;
      break;
    case 'adviser':
      moduleUrl = urlPrefix.adviser;
      break;
    case 'cash':
      moduleUrl = urlPrefix.cash;
      break;
    case 'coupon':
      moduleUrl = urlPrefix.coupon;
      break;
    case 'financing':
      moduleUrl = urlPrefix.financing;
      break;
    default:
      moduleUrl = urlPrefix.web;
  }

  // 删除模块字段
  if(typeof requestModule !== undefined) {
    delete options.body.module;
  }

  if(typeof url === 'object') {
    options = url;
    url = options.url;
  }

  url = !url.indexOf('http') ? url : moduleUrl + url;

  options.body = utils.addSrc(options.body);

  request(url, options, function(error, response, body) {
    var statusCode = response && response.statusCode || 500;

    // 判断数据中是否包含密码字段，有则不记录详细参数进日志
    var hasPwd = options.body.params.pwd ? 1 : 0;

    if(!error && statusCode === 200) {
      try {
        if(typeof body === 'string') {
          body = JSON.parse(body);
        }
      } catch(e) {
        if(hasPwd === 1) {
          requestLog.info('请求转发解析数据异常：【' + url + '】');
        } else {
          requestLog.info('请求转发解析数据异常：【' + url + '】', options, JSON.stringify(body));
        }

        deferred.reject({
          statusCode: 500,
          error: new Error(body)
        });

        return deferred.promise;
      }

      if(hasPwd === 1) {
        requestLog.info('请求转发成功：【' + url + '】');
      } else {
        requestLog.info('请求转发成功：【' + url + '】', options, JSON.stringify(body));
      }

      deferred.resolve(body);
    } else {
      if(hasPwd === 1) {
        requestLog.error('请求转发异常：【' + url + '】');
      } else {
        requestLog.error('请求转发异常：【' + url + '】', options, error || JSON.stringify(body));
      }

      deferred.reject({
        statusCode: statusCode,
        error: error || JSON.stringify(body) || new Error('亲！我好累，让我打个盹。')
      });
    }
  });

  return deferred.promise;
};

var _mRequest = function(options, cb) {
  if(_.isArray(options)) {
    return when.map(options, cb || _request);
  }

  if(_.isObject(options)) {
    return keys.map(options, cb || _request);
  }
};

ajax.map = {
  /*
   * @param options [object] 请求参数(必填)
   */
  request: function(options) {
    if(arguments.length > 1) {
      options = slice.call(arguments, 0);
    }

    return _mRequest(options);
  }
};

var verbs = ['get', 'head', 'post', 'put', 'patch', 'del'];

verbs.forEach(function(verb) {
  var method = verb === 'del' ? 'DELETE' : verb.toUpperCase();

  ajax[verb] = function(url, options) {
    if(typeof url === 'object') {
      options = url;
      url = options.url;
    }

    options = options || {};
    options.method = options.method || method;

    return _request(url, options);
  };

  ajax.map[verb] = function(options) {
    if(arguments.length > 1) {
      options = slice.call(arguments, 0);
    }

    return _mRequest(options, ajax[verb]);
  };
});

ajax.env = qiniuEnv;
ajax.urlPrefix = urlPrefix;
