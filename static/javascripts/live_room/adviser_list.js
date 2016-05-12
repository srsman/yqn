/*
 * 投顾直播间列表
 * @Author: 大发
 */

require([
  'jquery',
  'common'
], function($) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 初始化
   * @init: 模块初始化
   * @openLiveRoom: 打开直播间
   * @editLiveRoom: 打开编辑直播群窗口
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.openLiveRoom();
      SEMICOLON.initialize.editLiveRoom();
    },

    /* 打开直播间 */
    openLiveRoom: function() {
      $('.open-live-room').click(function() {
        var $el = $(this),
            id = $el.data('id'),
            name = $el.data('name'),
            charge = $el.data('charge'),
            ownerImId = $el.data('owner_imid'),
            createData = {};

        $('#qn-pager-wrap').removeClass('hide');
        $('#qn-pager-minimize').addClass('hide');

        createData['type'] = 'R';
        createData['name'] = name;
        createData['id'] = id;
        createData['charge'] = charge;
        createData['owner'] = 1;
        createData['ownerImId'] = ownerImId;

        $.chooseChatWindow(createData);
      });
    },

    /* 打开编辑直播群窗口 */
    editLiveRoom: function() {
      $('.edit-live-room').click(function() {
        var $el = $(this),
            id = $el.data('id'),
            charge = $el.data('charge'),
            createData = {};

        $('#qn-pager-wrap').removeClass('hide');
        $('#qn-pager-minimize').addClass('hide');

        createData['id'] = id;
        createData['charge'] = charge;
        createData['owner'] = 1;

        $.openEditWindow(createData);
      });
    }
  };

  /*
   * 元素加载时执行
   * @init: 模块初始化
   */
  SEMICOLON.documentOnReady = {
    init: function() {
      SEMICOLON.initialize.init();
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});
