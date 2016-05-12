/*
 * 券商
 * @qiulijun
 */
var express = require('express'),
    ajax = require('../../utils/ajax'),
    utils = require('../../utils/utils'),
    config = require('../../yiqiniu_config'),
    seoMeta = utils.seoMeta(),
    router = express.Router();

/*
 * 券商列表
 * @qiulijun
 */
router.get('/', function(req, res, next) {
  var newStockUrl = '/mktinfo_api/fetch_ipo_list',
      brokerListUrl = '/seo_api/fetch_area_broker_list',
      brokerListParams = {},
      newStockParams = {};

  var areaId = req.query.area || 0,
      brokerId = req.query.broker || 0,
      currPage = req.query.page || 1;

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 券商请求参数
  brokerListParams['params'] = {};
  brokerListParams['params']['areaId'] = areaId;
  brokerListParams['params']['brokerId'] = brokerId;
  brokerListParams['params']['currPage'] = currPage;
  brokerListParams['params']['rowsPerPage'] = 10;

  // 转发请求
  ajax.map.post({
    url: newStockUrl,
    body: newStockParams
  },{
    url: brokerListUrl,
    body: brokerListParams
  }).then(function(datas) {
    var newStockData = datas[0],
        brokerListData = datas[1];

    var brokerName,
        areaName;

    if(newStockData.code === 0 && brokerListData.code === 0) {
      var seoCustomMeta = {};

      if(areaId > 0 && brokerId > 0) {
        /* 券商及地域纬度 */
        var fullName;

        brokerName = brokerListData.result.busDepts[0].brokerType;

        for(var l = 0; l < brokerListData.result.areas.length; l++) {
          var itemL = brokerListData.result.areas[l],
              thisIdL = itemL.areaId;

          // 这里要用“==”，不要管代码检查
          if(thisIdL == areaId) {
            areaName = itemL.areaName;
          }
        }

        fullName = areaName + brokerName;

        seoCustomMeta['title'] = fullName + '股票开户|佣金|地址|电话|APP，一起牛 - 百姓身边的投资顾问';

        seoCustomMeta['keywords'] = fullName + '营业部，' + fullName + '股票开户，' + fullName + '免费开户，' + fullName + '地址，' + fullName + '电话，' + fullName + '软件下载，' + fullName + 'APP，' + fullName + '佣金，' + fullName + '专家';

        seoCustomMeta['description'] = config.seo.broker.description + fullName + '网上开户，' + fullName + '营业部怎么去？' + fullName + '投资顾问，' + fullName + '怎么样？' + fullName + '的佣金多少？' + fullName + '在线交易，2.5佣金，最低开户佣金';
      } else if(brokerId > 0) {
        /* 券商纬度 */
        brokerName = brokerListData.result.busDepts[0].brokerType;

        seoCustomMeta['title'] = brokerName + '营业部查询 - ' + config.seo.broker.title;

        seoCustomMeta['keywords'] = brokerName + '全国营业部，' + brokerName + '营业部，' + brokerName + '免费开户，' + brokerName + '地址，' + brokerName + '电话，' + brokerName + '软件下载，' + brokerName + 'APP，' + brokerName + '佣金，' + brokerName + '专家';

        seoCustomMeta['description'] = config.seo.broker.description + brokerName + '网上开户，' + brokerName + '怎么去？' + brokerName + '的佣金多少？' + brokerName + '投资顾问，' + brokerName + '哪个投顾厉害？网上24小时在线预约股票开户，开户能享受什么服务？' + brokerName + '投顾观点，券商软件下载，2.5佣金，最低开户佣金。';
      } else if(areaId > 0) {
        /* 地域纬度 */
        var areaBrokerName;

        for(var i = 0; i < brokerListData.result.areas.length; i++) {
          var item = brokerListData.result.areas[i],
              thisId = item.areaId;

          // 这里要用“==”，不要管代码检查
          if(thisId == areaId) {
            areaName = item.areaName;
            areaBrokerName = areaName + '证券公司';
          }
        }

        seoCustomMeta['title'] = areaBrokerName + '营业部查询 - ' + config.seo.broker.title;

        seoCustomMeta['keywords'] = areaBrokerName + '营业部，' + areaBrokerName + '排名，' + areaBrokerName + '股票开户，' + areaBrokerName + '免费开户，' + areaBrokerName + '地址，' + areaBrokerName + '电话，' + areaBrokerName + '软件下载，' + areaBrokerName + 'APP，' + areaBrokerName + '佣金， ' + areaBrokerName + '专家';

        seoCustomMeta['description'] = '股票开户哪家券商好？' + areaName + '股票开户哪家证券公司好？' + areaBrokerName + '网上开户，' + areaBrokerName + '怎么去？' + areaBrokerName + '投资顾问，' + areaName + '哪家证券公司出名，' + areaName + '哪家证券公司佣金低，' + areaBrokerName + '的佣金排名，' + areaBrokerName + '的佣金多少？网上24小时在线预约股票开户，开户能享受什么服务？华泰证券投顾观点，2.5佣金，最低开户佣金。';
      } else {
        seoCustomMeta['title'] = '券商开户，营业部查询 - ' + config.seo.broker.title;

        seoCustomMeta['keywords'] = config.seo.broker.keywords;

        seoCustomMeta['description'] = config.seo.broker.description + '券商软件下载，最低2.5开户佣金。';
      }

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('broker', seoCustomMeta);

      res.render('broker/seo_list', {
        widgetNewStocks: newStockData.result.stks,
        brokerInfo: brokerListData.result,
        seoMeta: seoMeta,
        user: req.session.userInfo,
        tag: {
          area: areaId,
          broker: brokerId
        }
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/*
 * 券商详情
 * @qiulijun
 */
router.get('/:area/:broker/:dept', function(req, res, next) {
  var newStockUrl = '/mktinfo_api/fetch_ipo_list',
      brokerListUrl = '/seo_api/fetch_bus_dept_info',
      newStockParams = {},
      brokerParams = {};

  // 新股请求参数
  newStockParams['module'] = 'market';
  newStockParams['params'] = {};
  newStockParams['params']['pageSize'] = 5;

  // 券商详情请求参数
  brokerParams['params'] = {};
  brokerParams['params']['areaId'] = req.params.area;
  brokerParams['params']['brokerId'] = req.params.broker;
  brokerParams['params']['busDeptId'] = req.params.dept;

  // 转发请求
  ajax.map.post({
    url: newStockUrl,
    body: newStockParams
  },{
    url: brokerListUrl,
    body: brokerParams
  }).then(function(datas) {
    var newStockData = datas[0],
        brokerData = datas[1];

    if(newStockData.code === 0 && brokerData.code === 0) {
      var fullName = brokerData.result[0].fullName,
          seoCustomMeta = {};

      seoCustomMeta['title'] = fullName + ' - ' + config.seo.broker.title;

      seoCustomMeta['keywords'] = fullName + '开户，' + fullName + '地址，' + fullName + '电话，' + fullName + '软件下载，' + fullName + 'APP，' + fullName + '佣金，' + fullName + '专家，股票开户流程，预约开户流程，开户常见问题，证券公司动态，开户软件下载，全国券商地址，最低佣金';

      seoCustomMeta['description'] = config.seo.broker.description + fullName + '网上开户，' + fullName + '怎么去？' + fullName + '佣金多少？' + fullName + '投资顾问，网上24小时在线预约股票开户，开户能享受什么服务？华泰证券投顾观点，券商软件下载，2.5佣金，最低开户佣金。';

      seoCustomMeta['mixins'] = 1;

      seoMeta = utils.seoMeta('broker', seoCustomMeta);

      res.render('broker/seo_info', {
        widgetNewStocks: newStockData.result.stks,
        broker: brokerData.result,
        seoMeta: seoMeta,
        user: req.session.userInfo
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

module.exports = router;
