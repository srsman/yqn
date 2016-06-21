/*---------- 引入依赖 ----------*/
var express = require('express'),
    log4js = require('log4js'), // log4js日志模块
    path = require('path'), // 获取路径地址中间件
    favicon = require('serve-favicon'), // 网页图标中间件
    cookieParser = require('cookie-parser'), // cookie解析中间件
    bodyParser = require('body-parser'), // 请求内容解析中间件
    session = require('express-session'),
    redisStore = require('connect-redis')(session),
    _ = require('lodash'),
    helmet = require('helmet'), // 安全性相关的HTTP头
    compression = require('compression'), // gzip压缩
    serverConfig = require('./server_config'), // 一起牛服务配置文件
    appConfig = require('./app_config'), // 一起牛应用配置文件
    utils = require('./utils/utils'); // 工具类

var app = express();

/*---------- 设置运行环境 ----------*/
var yiqiniuEnv,
    cfgEnv = serverConfig.env;

if(cfgEnv.development.status === true) {
  process.env.NODE_ENV = 'development';
  app.set('env', 'development');
} else if(cfgEnv.test.status === true) {
  process.env.NODE_ENV = 'test';
  app.set('env', 'test');
} else if(cfgEnv.production.status === true) {
  process.env.NODE_ENV = 'production';
  app.set('env', 'production');
}

yiqiniuEnv = app.get('env'); // 当前用户环境变量中NODE_ENV值
cfgEnv = cfgEnv[yiqiniuEnv]; // 当前启用的服务器环境配置

/*---------- 添加app.locals的title属性不生效，会被Express默认值覆盖 ----------*/
_.extend(app.locals, cfgEnv, appConfig.seo.default, {
  NODE_ENV: yiqiniuEnv
});

/*---------- 引入log4js的配置文件 ----------*/
log4js.configure('./log4js.json');

/*---------- 配置模板引擎 ----------*/
app.set('views', path.join(__dirname, 'views')); // 指定模板文件所在目录
app.set('view engine', 'jade'); // 设置使用jade作为模板引擎

/*---------- HTTP安全性header ----------*/
// app.use(helmet());

// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'", '*.yiqiniu.com', '192.168.1.181:*', '192.168.1.179:*', '192.168.1.181:*'],
//     scriptSrc: ["'self'", 'cdn.bootcss.com', "'unsafe-inline'"],
//     styleSrc: ["'self'", "'unsafe-inline'"],
//     imgSrc: ["'self'", 'data:', '*.yiqiniu.com:*', '192.168.1.181:*'],
//     sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-top-navigation', 'allow-popups'],
//     reportUri: '/report-violation',
//     objectSrc: []
//   },
//   // 禁止浏览器报错
//   reportOnly: false,
//   // 如果设置true, 将会添加已经被抛弃的兼容头部 X-WebKit-CSP, and X-Content-Security-Policy
//   setAllHeaders: false,
//   disableAndroid: false,
//   browserSniff: true
// }));

// // var ninetyDaysInMilliseconds = 7776000000; // 90天

// // app.use(helmet.hsts({
// //   maxAge: ninetyDaysInMilliseconds,
// //   force: true
// // }));

// app.use(bodyParser.json({
//   type: ['json', 'application/csp-report']
// }));

// // FIXED 记录浏览器在CSP头部下的错误信息
// app.post('/report-violation', function(req, res) {
//   if(req.body) {
//     console.log('CSP Violation: ', req.body)
//   } else {
//     console.log('CSP Violation: No data received!')
//   }

//   res.status(204).end();
// });

/*---------- Session处理 ----------*/
var redisOptions = {
      prefix: appConfig.session.prefix, // redis中作为key的前缀
      host: cfgEnv.redis[0].address, // redis服务器的ip地址
      port: cfgEnv.redis[0].port, // redis服务器的端口号
      ttl: appConfig.session.expire, // redis中session失效时间，秒
      db: 0
    },
    sessionOptions = {
      store: new redisStore(redisOptions), // 会话储存实例，默认为一个新内存中的实例
      secret: appConfig.session.secret,
      resave: false,
      cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: appConfig.session.expire * 1000 // cookie失效时间，毫秒数
      },
      saveUninitialized: false // 不允许一开始就保存到redis
    };

app.use(session(sessionOptions));

/*---------- 使用中间件 ----------*/
// 设置网站icon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// 使用http日志模块
app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));
// 请求内容支持json
app.use(bodyParser.json());
// 请求内容支持urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// 解析Cookies的头通过req.cookies得到cookies
app.use(cookieParser());
// gzip压缩
app.use(compression());
// 指定静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// 创建验证码文件路径
utils.mkdirsSync('./utils/ccap/cap_img');

/*---------- 如果配置文件中官网维护为true，重定向维护页面 ----------*/
var appUpdate = serverConfig.maintain.update,
    appUpdateMessage = serverConfig.maintain.message;

if(appUpdate === true) {
  app.use(function(req, res) {
    res.render('update/update_main', {
      message: appUpdateMessage
    });
  });
}

/*---------- 引入路由目录（需整改，整改后删除） ----------*/
var liveRoom = require('./routes/live_room'),
    question = require('./routes/question'),
    portfolio = require('./routes/portfolio'),
    viewpoint = require('./routes/viewpoint'),
    contacts = require('./routes/contacts'),
    message = require('./routes/message'),
    protocols = require('./routes/protocols'),
    mobile = require('./routes/mobile'),
    im = require('./routes/im');

/*---------- 设置路由（需整改，整改后删除） ----------*/
app.use('/live_room', liveRoom); // 直播间
app.use('/question', question); // 问答
app.use('/portfolio', portfolio); // 组合
app.use('/contacts', contacts); // 联系人
app.use('/message', message); // 获取消息
app.use('/im', im); // 即时通信
app.use('/protocols', protocols); // 协议
app.use('/viewpoint', viewpoint); // 观点
app.use('/mobile', mobile); //手机适配

/* ----------------------------------------
 * 该注释以上为老版路由，需要修改，新添路由都在该注释之下
 ---------------------------------------- */

/*---------- 引入API目录 ----------*/
var accountsApi = require('./routes/api/account'), // 账户管理
    viewpointApi = require('./routes/api/viewpoint'), // 观点
    brokerApi = require('./routes/api/broker'), // 券商
    questionApi = require('./routes/api/question'), // 问答
    newsApi = require('./routes/api/news'), // 新闻
    stockApi = require('./routes/api/stock'), // 股票
    industryApi = require('./routes/api/industry'); // 行业

/*---------- 设置API路由 ----------*/
app.use('/account', accountsApi); // 账户管理
app.use('/viewpoint1', viewpointApi); // 观点
app.use('/stock', stockApi); // 股票
app.use('/broker', brokerApi); // 券商
app.use('/question1', questionApi); // 问答
app.use('/news', newsApi); // 新闻
app.use('/industry', industryApi); // 行业

/*---------- 引入模板目录 ----------*/
var indexTpl = require('./routes/tpl/index'), // 首页，网站入口
    marketTpl = require('./routes/tpl/market'), // 市场
    viewpointTpl = require('./routes/tpl/viewpoint'), // 观点
    brokerTpl = require('./routes/tpl/broker'), // 券商
    questionTpl = require('./routes/tpl/question'), // 问答
    newsTpl = require('./routes/tpl/news'), // 新闻
    stockTpl = require('./routes/tpl/stock'), // 股票
    newStockTpl = require('./routes/tpl/new_stock'), // 新股
    industryTpl = require('./routes/tpl/industry'), // 行业
    promotionTpl = require('./routes/tpl/promotion/index'), // 单页活动
    staticTpl = require('./routes/tpl/static'), // 静态页面
    captcha =  require('./routes/tpl/captcha'); // 验证码

/*---------- 设置模板路由 ----------*/
app.use('/', indexTpl); // 首页，网站入口
app.use('/shichang', marketTpl); // 市场
app.use('/guandian', viewpointTpl); // 观点
app.use('/gupiao', stockTpl); // 股票
app.use('/xingu', newStockTpl); // 新股
app.use('/quanshang', brokerTpl); // 券商
app.use('/wenda', questionTpl); // 问答
app.use('/xinwen', newsTpl); // 新闻
app.use('/hangye', industryTpl); // 新闻
app.use('/huodong', promotionTpl); // 单页活动
app.use('/static', staticTpl); // 静态页面
app.use('/captcha', captcha); // 验证码

/*---------- 公用元素查看路由 ----------*/
if(yiqiniuEnv === 'development') {
  var indexDemo = require('./routes/demo/index'); // 公共演示模块入口

  app.use('/demo', indexDemo); // 公共演示模块入口
}

/*---------- 错误处理 ----------*/
var appLog = log4js.getLogger('app'); // 调用app日志模块

/* 404页面处理机制 */
app.use(function(req, res, next) {
  var err = new Error('找不到页面：' + req.url);

  err.status = 404;

  next(err);
});

/* 渲染错误模板 */
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  if(err.status === 404) {
    appLog.error('找不到页面：' + req.url, err);

    res.render('error/error_404', {
      message: err.message
    });
  } else {
    appLog.error('出错了：' + req.url, err);

    res.render('error/error', {
      message: err.message
    });
  }
});

module.exports = app;
