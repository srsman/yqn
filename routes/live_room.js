/*
 * 直播间
 * @Author: 大发
 */

var express = require('express'),
    ajax = require('../utils/ajax'),
    utils = require('../utils/utils'),
    router = express.Router();

/* 直播间列表 */
router.get('/list', utils.session, function(req, res, next) {
  var listUrl = '/im_api/fetch_adviser_group_list', // 直播群列表
      countUrl = '/im_api/fetch_adviser_group_num', // 直播群统计数据
      listParams = {},
      countParams = {};

  listParams['params'] = {};
  countParams['params'] = {};

  listParams = utils.authUser(req, res, listParams);
  countParams = utils.authUser(req, res, countParams);

  listParams['params']['adviserUserId'] = req.session.userToken;

  ajax.map.post({
    url: listUrl,
    body: listParams
  }, {
    url: countUrl,
    body: countParams
  }).then(function(datas) {
    if(datas[0].code === 0 && datas[1].code === 0) {
      var listResult;

      if(datas[0].result !== undefined) {
        listResult = datas[0].result.data;
      } else {
        listResult = [];
      }

      res.render('live_room/adviser_list', {
        list: listResult,
        count: datas[1].result,
        user: req.session.userInfo
      });
    } else {
      utils.errorHandler(res, datas);
    }
  }, function(data) {
    utils.errorHandler(res, data);
  });
});

/* 聊天中的直播群列表 */
router.post('/rooms', utils.session, function(req, res) {
  var url = '/im_api/fetch_imgroup_list',
      params = {};

  params['params'] = {};

  params = utils.authUser(req, res, params);

  ajax.post(url, {
    body: params,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 创建直播间 */
router.route('/create')
.get(utils.session, function(req, res, next) {
  res.render('live_room/adviser_create', {
    title: '创建直播群',
    user: req.session.userInfo
  });
})
.post(utils.session, function(req, res) {
  var url = '/im_api/create_imgroup';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 查看直播群信息 */
router.post('/read', utils.session, function(req, res) {
  var url = '/im_api/fetch_imgroup_info';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 编辑直播间 */
router.post('/upload', utils.session, function(req, res) {
  var url = '/im_api/imgroup_setting';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 查询群成员列表 */
router.post('/members', utils.session, function(req, res) {
  var url = '/im_api/fetch_imgroup_members';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 模糊查询群成员 */
router.post('/query_members', utils.session, function(req, res) {
  var url = '/im_api/search_imgroup_members';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 添加新成员 */
router.post('/add_members', utils.session, function(req, res) {
  var url = '/im_api/imgroup_add_users';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 删除群成员 */
router.post('/delete_members', utils.session, function(req, res) {
  var url = '/im_api/imgroup_delete_members';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 退出直播群 */
router.post('/quit', utils.session, function(req, res) {
  var url = '/im_api/quit_imgroup';

  req.body = utils.authUser(req, res, req.body);

  ajax.post(url, {
    body: req.body,
    json: true
  }).then(function(data) {
    res.status(200).json(data);
  }, function(data) {
    res.status(data.code).json(data);
  });
});

/* 解散直播群 */
router.post('/dissolution', utils.session, function(req, res) {
  var url = '/im_api/delete_imgroup';

  req.body = utils.authUser(req, res, req.body);

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
