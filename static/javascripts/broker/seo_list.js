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

  var indexParams = {
    area : 0,
    broker : 0
  };

  SEMICOLON.initialize = {

    init: function() {
      SEMICOLON.initialize.UrlParse();
      SEMICOLON.initialize.handleSelectorLink();
      SEMICOLON.initialize.handleExpandBtn();
    },

    UrlParse:function() {
      var url = window.location.href;

      url.replace(/\??(\w+)\=(\w+)/g, function(match, key, val) {
        if(typeof indexParams[key] !== 'undefined') {
          indexParams[key] = val;
        }
      });
    },

    handleSelectorLink: function() {
      var areaSelector = $('#area-line'),
          brokerSelector = $('#broker-line');

      areaSelector.on('click', 'a', function() {
        indexParams.area = $(this).data('id');
        SEMICOLON.initialize.redirect();
      });

      brokerSelector.on('click', 'a', function() {
        indexParams.broker = $(this).data('id');
        SEMICOLON.initialize.redirect();
      });
    },

    redirect: function() {
      var urlParams = '';
      indexParams.page = 1;
      for( var i in indexParams) {
        urlParams +=
                  ( urlParams === '' ? '?' : '&' ) + i + '=' + indexParams[i];
      }
      window.location.href = '/quanshang' + urlParams;
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