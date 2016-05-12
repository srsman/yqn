/* 引入依赖 */
var express = require('express'),
    log4js = require('log4js'), // log4js日志模块
    path = require('path'), // 获取路径地址中间件
    favicon = require('serve-favicon'), // 网页图标中间件
    cookieParser = require('cookie-parser'), // cookie解析中间件
    bodyParser = require('body-parser'), // 请求内容解析中间件
    session = require('express-session'),
    redisStore = require('connect-redis')(session),
    _ = require('lodash'),
    config = require('./yiqiniu_config'); // 一起牛配置文件

var app = express();

/* 设置运行环境 */
var yiqiniuEnv,
    cfgEnv = config.env;

if(cfgEnv.development.status) {
  process.env.NODE_ENV = 'development';
} else if(cfgEnv.test.status) {
  process.env.NODE_ENV = 'test';
} else if(cfgEnv.production.status) {
  process.env.NODE_ENV = 'production';
}

/* 设置log4js的日志模块 */
log4js.configure('./log4js.json'); // 引入log4js的配置文件

var appLog = log4js.getLogger('app'); // 调用app日志模块

/* 配置模板引擎 */
// 指定模板文件所在目录
app.set('views', path.join(__dirname, 'views'));
// 设置使用jade作为模板引擎
app.set('view engine', 'jade');

/* Session处理 */
var redis = config.env[process.env.NODE_ENV].redis,
    options = {
      // prefix: config.session.prefix, // 会重复两级目录
      host: redis[0].address, // redis服务器的ip地址
      port: redis[0].port, // redis服务器的端口号
      ttl: config.session.expire, // 会话超时的秒数
      db: 0
    };

app.use(session({
  store: new redisStore(options), // 会话储存实例，默认为一个新内存中的实例
  secret: config.session.secret,
  resave: false,
  cookie: {
    maxAge: config.session.expire
  },
  saveUninitialized: false // 不允许一开始就保存到redis
}));

/* 使用中间件 */
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
// 指定静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 如果配置文件中官网维护为true，那所有路由重定向维护页面
var appUpdate = config.maintain.update,
    appUpdateMessage = config.maintain.message;

if(appUpdate === true) {
  app.use(function(req, res, next) {
    res.render('update/update_main', {
      message: appUpdateMessage
    });
  });
}

/* 引入路由目录 */
var liveRoom = require('./routes/live_room'),
    question = require('./routes/question'),
    portfolio = require('./routes/portfolio'),
    viewpoint = require('./routes/viewpoint'),
    contacts = require('./routes/contacts'),
    message = require('./routes/message'),
    protocols = require('./routes/protocols'),
    mobile = require('./routes/mobile'),
    im = require('./routes/im');

/* 设置路由 */
app.use('/live_room', liveRoom); // 直播间
app.use('/question', question); // 问答
app.use('/portfolio', portfolio); // 组合
app.use('/contacts', contacts); // 联系人
app.use('/message', message); // 获取消息
app.use('/im', im); // 即时通信
app.use('/protocols', protocols); //协议
app.use('/viewpoint', viewpoint); //观点
app.use('/mobile', mobile); //手机适配

/*
 * 该注释以上为老版路由，需要修改，新添路由都在该注释之下
 */

/* 引入模板目录 */
var indexTpl = require('./routes/tpl/index'), // 首页，网站入口
    marketTpl = require('./routes/tpl/market'), // 市场
    viewpointTpl = require('./routes/tpl/viewpoint'), // 观点
    brokerTpl = require('./routes/tpl/broker'), // 券商
    questionTpl = require('./routes/tpl/question'), // 问答
    newsTpl = require('./routes/tpl/news'), // 新闻
    stockTpl = require('./routes/tpl/stock'), // 股票
    newStockTpl = require('./routes/tpl/new_stock'), // 新股
    promotionTpl = require('./routes/tpl/promotion/index'), // 单页活动
    staticTpl = require('./routes/tpl/static'); // 静态页面

/* 设置模板路由 */
app.use('/', indexTpl); // 首页，网站入口
app.use('/shichang', marketTpl); // 市场
app.use('/guandian', viewpointTpl); // 观点
app.use('/gupiao', stockTpl); // 股票
app.use('/xingu', newStockTpl); // 新股
app.use('/quanshang', brokerTpl); // 券商
app.use('/wenda', questionTpl); // 问答
app.use('/xinwen', newsTpl); // 新闻
app.use('/huodong', promotionTpl); // 单页活动
app.use('/static', staticTpl); // 静态页面

/* 引入API目录 */
var accountsApi = require('./routes/api/account'), // 账户管理
    viewpointApi = require('./routes/api/viewpoint'), // 观点
    brokerApi = require('./routes/api/broker'), // 券商
    questionApi = require('./routes/api/question'), // 问答
    newsApi = require('./routes/api/news'), // 新闻
    stockApi = require('./routes/api/stock'); // 股票

/* 设置API路由 */
app.use('/account', accountsApi); // 账户管理
app.use('/viewpoint1', viewpointApi); // 观点
app.use('/stock', stockApi); // 股票
app.use('/broker', brokerApi); // 券商
app.use('/question1', questionApi); // 问答
app.use('/news', newsApi); // 新闻

// 当前用户环境变量中NODE_ENV值
var qiyiniuEnv = app.get('env');

/* 错误处理 */
// 404页面处理机制
app.use(function(req, res, next) {
  var err = new Error('找不到页面：' + req.url);

  err.status = 404;

  next(err);
});

if(qiyiniuEnv === 'development') {
  // 开发环境中的错误处理，将打印堆栈跟踪
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    if(err.status === 404) {
      appLog.error('找不到页面：' + req.url, err);

      res.render('error/error_404', {
        message: err.message,
        error: err
      });
    } else {
      appLog.error('出错了：' + req.url, err);

      res.render('error/error', {
        message: err.message,
        error: err
      });
    }
  });
} else {
  // 生产环境中的错误处理，不会泄露用户堆栈路线
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    if(err.status === 404) {
      appLog.error('找不到页面：' + req.url, err);

      res.render('error/error_404', {
        message: err.message,
        error: {}
      });
    } else {
      appLog.error('出错了：' + req.url, err);

      res.render('error/error', {
        message: err.message,
        error: {}
      });
    }
  });
}

//添加app.locals的title属性不生效，会被Express默认值覆盖
_.extend(app.locals, config.seo.default);

module.exports = app;
