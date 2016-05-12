/*
 * 新股
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    config = require('../../yiqiniu_config'),
    seoMeta = utils.seoMeta(),
    moment =require('moment'),
    router = express.Router();

/* 新股列表 */
router.get('/', function(req, res, next) {
  var stockUrl = '/mktinfo_api/fetch_stk_list', // 股票列表
      newStockUrl = '/mktinfo_api/fetch_ipo_list', // 新股预告
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockParams = {},
      newStockParams = {},
      brokerParams = {};

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 20;
  newStockParams['params']['curPage'] = req.query.page || 1;

  // 股票列表请求参数
  stockParams['module'] = 'market';
  stockParams['params'] = {};
  stockParams['params']['pageSize'] = 5;

  // 推荐券商请求参数
  brokerParams['params'] = {};
  brokerParams['params']['brokerNum'] = 4;

  ajax.map.post({
    url: newStockUrl,
    body: newStockParams
  }, {
    url: stockUrl,
    body: stockParams
  }, {
    url: brokerUrl,
    body: brokerParams
  }).then(function(datas) {
    var newStockData = datas[0],
        stocksData = datas[1],
        broderData = datas[2];

    if(newStockData.code === 0 && stocksData.code === 0 && broderData.code === 0) {
      var seoCustomMeta = {};

      seoCustomMeta['title'] = '新股预告';

      seoMeta = utils.seoMeta('newStock', seoCustomMeta);

      res.render('stock/seo_new_stock_list', {
        newStocks: newStockData.result, // 新股预告
        widgetStocks: stocksData.result.stks, // 热门股票
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

/* 新股详情 */
router.get('/:id', function(req, res, next) {
  var stockInfoUrl = '/mktinfo_api/get_quot', // 股票信息
      hotStockUrl = '/mktinfo_api/fetch_stk_list', // 热门股票
      skilledAdvisersUrl = '/adviser/fetch_skilled_advisers', // 擅长投顾
      stockNewsUrl = '/mktinfo_api/fetch_news_list', // 股票相关资讯
      stockQuestionUrl = '/adviser/stk_qa_list', // 股票相关问答
      stockViewpointUrl = '/adviser/fetch_viewpoint_list_by_type', // 股票相关观点
      brokerUrl = '/seo_api/fetch_recommend_broker', // 券商开户
      stockInfoParams = {},
      stockNewsParams = {},
      stockNoticeParams = {},
      stockQuestionParams = {},
      stockViewpointParams = {},
      skilledAdvisersParams = {},
      hotStockParams = {},
      brokerParams = {};

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

  // 热门股票列表
  hotStockParams['module'] = 'market';
  hotStockParams['params'] = {};
  hotStockParams['params']['pageSize'] = 10;

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
    url: hotStockUrl,
    body: hotStockParams
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
        hotStockData = datas[1],
        skilledAdvisersData = datas[2],
        stockNewsData = datas[3],
        stockNoticeData = datas[4],
        stockQuestionData = datas[5],
        stockViewpointData = datas[6],
        brokerData = datas[7];

    if(stockInfoData.code === 0 && hotStockData.code === 0 && skilledAdvisersData.code === 0 && stockNewsData.code === 0 && stockNoticeData.code === 0 && stockQuestionData.code === 0 && stockViewpointData.code === 0 && brokerData.code === 0) {

      var seoCustomMeta = {};

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

      // 判断是否有行情数据，没有则查询发行数据
      if(!stockInfoData.result || stockInfoData.result.data[0][19] == 6) {
        var stockIpoInfoUrl = '/mktinfo_api/fetch_ipo_detail',
            stockIpoInfoParams = {};

        stockIpoInfoParams['module'] = 'market';
        stockIpoInfoParams['params'] = {};
        stockIpoInfoParams['params']['assetId'] = assetId;

        ajax.post(stockIpoInfoUrl, {
          body: stockIpoInfoParams,
          json: true
        }).then(function(data) {
          if(data.code === 0) {
            var sName = data.result.stk.stkName,
                sId = data.result.stk.assetId;

            seoCustomMeta['title'] = sName + sId + '股票详情';

            seoCustomMeta['keywords'] = sName + '申购，' + sName + '发行时间，' + sName + '上市时间';

            seoCustomMeta['description'] = sName + '怎么申购？' + sName + '市场评估？' + sName + '的投顾观点';

            seoMeta = utils.seoMeta('newStock', seoCustomMeta);

            res.render('stock/seo_stock_info', {
              stockInfo: data.result, // 股票信息
              stockNews: stockNewsData.result.data, // 股票相关新闻
              stockNotice: stockNoticeData.result.data, // 股票相关公告
              stockQuestion: stockQuestionData.result.qa, // 股票相关问答
              stockViewpoint: stockViewpointData.result.data, // 股票相关观点
              widgetStocks: hotStockData.result.stks, // 新股预告
              widgetSkilledAdvisers: skilledAdvisersData.result.data, // 擅长投顾
              widgetBrokers: brokerData.result.brokers, // 推荐券商
              seoMeta: seoMeta,
              user: req.session.userInfo, // 用户Session信息
              moment: moment,
              utils: utils
            });
          } else {
            utils.errorHandler(res, data);
          }
        }, function(data) {
          utils.errorHandler(res, data);
        });
      } else {
        res.redirect('/gupiao/' + stockInfoData.result.data[0][0]);
      }
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

module.exports = router;
