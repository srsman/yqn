/*
 * 股票
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    config = require('../../yiqiniu_config'),
    seoMeta = utils.seoMeta(),
    moment =require('moment'),
    router = express.Router();

/* 股票列表 */
router.get('/', function(req, res, next) {
  var stockUrl = '/mktinfo_api/fetch_stk_list', // 股票列表
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockParams = {},
      newStockParams = {},
      brokerParams = {};

  // 股票列表请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 20;
  stockParams['params']['curPage'] = req.query.page || 1;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  ajax.map.post({
    url: stockUrl,
    body: stockParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stocksData = datas[0],
        newStockData = datas[1],
        broderData = datas[2];

    if(stocksData.code === 0 && newStockData.code === 0 && broderData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = 'A股股票一览';

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      res.render('stock/seo_stock_list', {
        stocks: stocksData.result, // 热门股票
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetBrokers: broderData.result.brokers, // 推荐券商
        seoMeta: seoMeta,
        user: req.session.userInfo, // 用户Session信息
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 股票详情 */
router.get('/:id', function(req, res, next) {
  var stockInfoUrl = '/mktinfo_api/get_quot', // 股票信息
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      skilledAdvisersUrl = '/adviser/fetch_skilled_advisers', // 擅长投顾
      stockNewsUrl = '/mktinfo_api/fetch_news_list', // 股票相关资讯
      stockQuestionUrl = '/adviser/stk_qa_list', // 股票相关问答
      stockViewpointUrl = '/adviser/fetch_viewpoint_list_by_type', // 股票相关观点
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockInfoParams = {},
      newStockParams = {},
      skilledAdvisersParams = {},
      brokerParams = {},
      stockNewsParams = {},
      stockNoticeParams = {},
      stockQuestionParams = {},
      stockViewpointParams = {};

  var assetId = req.params.id; // 资产ID

  /*
   * 股票详情
   * @fields:
   * 0: 资产ID[0]
   * 1: 资产名称[1]
   * 2: 现价[2]
   * 3: 最高[3]
   * 4: 最低[4]
   * 5: 开盘价[5]
   * 6: 昨收价[6]
   * 7: 成交额[7]
   * 8: 成交量[8]
   * 9: 涨跌[9]
   * 10: 涨跌幅[10]
   * 13: 涨停价[11]
   * 14: 跌停价[12]
   * 15: 时间戳[13]
   * 37: 换手率[14]
   * 38: 总市值[15]
   * 39: 市盈率[16]
   * 40: 市净率[17]
   * 41: 流通市值[18]
   * 42: 资产状态[19]
   */
  stockInfoParams['module'] = 'market';
  stockInfoParams['params'] = {};
  stockInfoParams['params']['assetIds'] = [assetId];
  stockInfoParams['params']['fields'] = '0|1|2|3|4|5|6|7|8|9|10|13|14|15|37|38|39|40|41|42';

  // 新股列表
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 擅长投顾
  skilledAdvisersParams['module'] = 'adviser';
  skilledAdvisersParams['params'] = {};
  skilledAdvisersParams['params']['assetId'] = assetId;
  skilledAdvisersParams['params']['count'] = 3;

  // 相关新闻
  stockNewsParams['module'] = 'market';
  stockNewsParams['params'] = {};
  stockNewsParams['params']['assetId'] = assetId;
  stockNewsParams['params']['type'] = 1;
  stockNewsParams['params']['count'] = 10;

  // 相关公告
  stockNoticeParams['module'] = 'market';
  stockNoticeParams['params'] = {};
  stockNoticeParams['params']['assetId'] = assetId;
  stockNoticeParams['params']['type'] = 2;
  stockNoticeParams['params']['count'] = 10;

  // 相关问答
  stockQuestionParams['module'] = 'adviser';
  stockQuestionParams['params'] = {};
  stockQuestionParams['params']['assetId'] = assetId;
  stockQuestionParams['params']['count'] = 10;

  // 相关观点
  stockViewpointParams['module'] = 'adviser';
  stockViewpointParams['params'] = {};
  stockViewpointParams['params']['type'] = 'S';
  stockViewpointParams['params']['targetId'] = assetId;
  stockViewpointParams['params']['count'] = 10;
  stockViewpointParams['params']['readId'] = 0;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  // 转发请求
  ajax.map.post({
    url: stockInfoUrl,
    body: stockInfoParams
  }, {
    url: newStockUrl,
    body: newStockParams
  }, {
    url: skilledAdvisersUrl,
    body: skilledAdvisersParams
  }, {
    url: stockNewsUrl,
    body: stockNewsParams
  }, {
    url: stockNewsUrl,
    body: stockNoticeParams
  }, {
    url: stockQuestionUrl,
    body: stockQuestionParams
  }, {
    url: stockViewpointUrl,
    body: stockViewpointParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var stockInfoData = datas[0],
        newStockData = datas[1],
        skilledAdvisersData = datas[2],
        stockNewsData = datas[3],
        stockNoticeData = datas[4],
        stockQuestionData = datas[5],
        stockViewpointData = datas[6],
        brokerData = datas[7];

    if(stockInfoData.code === 0 && newStockData.code === 0 && skilledAdvisersData.code === 0 && stockNewsData.code === 0 && stockNoticeData.code === 0 && stockQuestionData.code === 0 && stockViewpointData.code === 0 && brokerData.code === 0) {
      var sName = stockInfoData.result.data[0][1],
          sId = stockInfoData.result.data[0][0],
          seoCustomMeta = {};

      seoCustomMeta['title'] = sName + sId + '股票详情 - 在线交易_股票行情_指标分析_一起牛';

      seoCustomMeta['keywords'] = '新闻报道，个股公告，股票问答，投资观点，股票行情，指标分析，行情中心，实时行情,在线交易，财务分析，同行比较，市场表现，交易数据，公司介绍，研究报告';

      seoCustomMeta['description'] = sName + '股票行情，' + sName + '指标分析，' + sName + '最新新闻，' + sName + '新闻公告，' + sName + '相关问答，' + sName  + '投顾观点，实时解盘，研究报告，行业研报，F10资料，财务数据，阶段涨幅，分红融资， 主营业务收入，个股研报，经营分析，重大事项，股权信息。';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('stock', seoCustomMeta);

      // 给投顾加上分享链接
      if(skilledAdvisersData.result.data.length) {
        for(var i = 0; i < skilledAdvisersData.result.data.length; i++) {
          var item = skilledAdvisersData.result.data[i],
              thisUid = item.userId,
              thisUrl,
              qiniuEnv = process.env.NODE_ENV, // 当前的项目环境
              shareUrl = config.env[qiniuEnv].target.h5; // 当前项目环境的分享地址;

          thisUrl = shareUrl + '/webstatic/register/card.html?userId=' + thisUid;

          skilledAdvisersData.result.data[i]['shareUrl'] = thisUrl;
        }
      }

      // 判断有没有新闻
      if(!stockNewsData.result) {
        stockNewsData['result'] = {};
        stockNewsData['result']['data'] = {};
      }

      // 判断有没有公告
      if(!stockNoticeData.result) {
        stockNoticeData['result'] = {};
        stockNoticeData['result']['data'] = {};
      }

      // 判断有没有问答
      if(!stockQuestionData.result) {
        stockQuestionData['result'] = {};
        stockQuestionData['result']['qa'] = {};
      }

      // 判断有没有观点
      if(!stockViewpointData.result.data) {
        stockViewpointData['result']['data'] = {};
      }

      res.render('stock/seo_stock_info', {
        stockInfo: stockInfoData.result.data[0], // 股票信息
        stockNews: stockNewsData.result.data, // 股票相关新闻
        stockNotice: stockNoticeData.result.data, // 股票相关公告
        stockQuestion: stockQuestionData.result.qa, // 股票相关问答
        stockViewpoint: stockViewpointData.result.data, // 股票相关观点
        widgetNewStocks: newStockData.result.stks, // 新股预告
        widgetSkilledAdvisers: skilledAdvisersData.result.data, // 擅长投顾
        widgetBrokers: brokerData.result.brokers, // 推荐券商
        seoMeta: seoMeta,
        user: req.session.userInfo, // 用户Session信息
        moment: moment,
        utils: utils
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

module.exports = router;

