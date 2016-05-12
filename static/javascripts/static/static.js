/*
 * 静态页面
 * @qiulijun
 */

require([
  'jquery',
  'common'
], function($) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.handleLink();
    },

    handleLink: function() {

      $('.qn-job-list').on('click', 'a', function() {

        var targetId = $(this).data('id');
        var top = $(targetId).position().top;
        $('body, html').stop(true).animate({scrollTop: top-200}, 400);

      });

      $('.more').on('click', function() {
        var targetId = $(this).data('id');
        var top = $(targetId).position().top;
        $('body, html').stop(true).animate({scrollTop: top-160}, 400);
      });

      var $shadow = $('.qn-seo-shadow'),
          $diglog = $('.qn-seo-dialog');

      $('#certification').on('click', function() {
        $shadow.toggle();
        $diglog.toggle();
      });

      $('#dialog-close').on('click', function() {
        $shadow.hide();
        $diglog.hide();
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