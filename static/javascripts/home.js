require([
  'jquery',
  'common'
], function($) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 初始化
   * @init: 模块初始化方法
   * @switchAdviser: switchAdviser
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.switchAdviser();
    },

    // 切换首页投顾
    switchAdviser: function() {
      $('#switch-home-adviser').click(function() {
        $(this).siblings('.row').each(function() {
          if($(this).hasClass('hide')) {
            $(this).removeClass('hide');
          } else {
            $(this).addClass('hide');
          }
        });
      });
    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化方法
   */
  SEMICOLON.documentOnReady = {
    init: function() {
      SEMICOLON.initialize.init();
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});