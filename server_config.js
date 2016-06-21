/* 环境配置 */
exports.env = {
  development: {
    status: true, // 环境状态
    debug: false,
    port: {
      https: 2176,
      http: 2177
    },
    redirect: {
      port: 2178,
      url: 'https://devweb.yiqiniu.com:2177'
    },
    strictSSL: false,
    secretKey: '562872563', // 加密key
    target: {
      user: 'https://devweb.yiqiniu.com:9000', // 用户体系
      market: 'https://devweb.yiqiniu.com:9001', // 行情
      portfolio: 'https://devweb.yiqiniu.com:9002', // 组合
      h5: 'https://devweb.yiqiniu.com:9003', // web h5
      im: 'https://devweb.yiqiniu.com:9004', // 即时通信
      adviser: 'https://devweb.yiqiniu.com:9005', // 投顾，包含问答、观点
      cash: 'https://devweb.yiqiniu.com:9006', // 支付
      coupon: 'https://devweb.yiqiniu.com:9007', // 卡券
      financing: 'https://devweb.yiqiniu.com:9009', // 理财
      web: 'http://192.168.1.181:9017' // 现在官网服务
    },
    redis: [
      {
        address: '192.168.1.180',
        port: '6379'
      }
    ],
    oldWeb: 'http://192.168.1.181:9300'
  },
  test: {
    status: false, // 环境状态
    debug: false,
    port: {
      https: 2176,
      http: 2177
    },
    redirect: {
      port: 2178,
      url: 'https://uatweb.yiqiniu.com:2177'
    },
    strictSSL: false,
    secretKey: '562872563', // 加密key
    target: {
      user: 'http://192.168.1.179:9000', // 用户体系
      market: 'http://192.168.1.179:9001', // 行情
      portfolio: 'http://192.168.1.179:9002', // 组合
      h5: 'http://192.168.1.179:9003', // web h5
      im: 'http://192.168.1.179:9004', // 即时通信
      adviser: 'http://192.168.1.179:9005', // 投顾，包含问答、观点
      cash: 'http://192.168.1.179:9006', // 支付
      coupon: 'http://192.168.1.179:9007', // 卡券
      financing: 'http://192.168.1.179:9009', // 理财
      web: 'http://192.168.1.179:9011' // 现在官网服务
    },
    redis: [
      {
        address: '192.168.1.179',
        port: '6379'
      }
    ],
    oldWeb: 'http://192.168.1.179:9300'
  },
  production: {
    status: false, // 环境状态
    debug: false,
    port: {
      https: 443,
      http: 80
    },
    redirect: {
      port: 81,
      url: 'https://www.yiqiniu.com'
    },
    strictSSL: true,
    secretKey: '863632652', // 加密key
    target: {
      user: 'https://api.yiqiniu.com:9000', // 用户体系
      market: 'https://api.yiqiniu.com:9001', // 行情
      portfolio: 'https://api.yiqiniu.com:9002', // 组合
      h5: 'https://api.yiqiniu.com:9003', // web h5
      im: 'https://api.yiqiniu.com:9004', // 即时通信
      adviser: 'https://api.yiqiniu.com:9005', // 投顾，包含问答、观点
      cash: 'https://api.yiqiniu.com:9006', // 支付
      coupon: 'https://api.yiqiniu.com:9007', // 卡券
      financing: 'https://api.yiqiniu.com:9009', // 理财
      web: 'http://official.yiqiniu.com:9011' // 现在官网服务
    },
    redis: [
      {
        address: '10.169.213.175',
        port: '6379'
      }
    ],
    oldWeb: 'https://oldweb.yiqiniu.com:9010'
  }
};

/* 是否在维护 */
exports.maintain = {
  update: false,
  message: '一起牛正在抓紧升级中。'
};
