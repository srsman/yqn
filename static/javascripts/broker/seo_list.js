/*
 * 券商列表
 * @qiulijun
 */

require([
  'jquery',
  'common'
], function($, template) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.handleSelectorLink();
      SEMICOLON.initialize.handleExpandBtn();
    },

    handleSelectorLink: function() {
      var areaSelector = $('#area-line'),
          brokerSelector = $('#broker-line');

      areaSelector.on('click', 'a', function() {
        $('#cur-area').val($(this).data('id'));
        SEMICOLON.initialize.redirect();
      });

      brokerSelector.on('click', 'a', function() {
        $('#cur-broker').val($(this).data('id'));
        SEMICOLON.initialize.redirect();
      });
    },

    redirect: function() {
      var curArea = $('#cur-area').val(),
          curBroker = $('#cur-broker').val();

      window.location.href = '/quanshang/' + curArea + '/' + curBroker;
    },

    handleExpandBtn: function() {
      $('.option-expand').click(function() {
        var $this = $(this);
        var $that = $('#'+$this.data('id'));
        $that.toggleClass('closed');
        $this.html( $that.hasClass('closed') ? '展开&nbsp;<i class="fa fa-chevron-down" />' : '收起&nbsp;<i class="fa fa-chevron-up" />');
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