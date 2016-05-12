/*
 * 同类问答加载
 * @qiulijun
 */

require([
  'jquery',
  'template',
  'common'
], function($, template) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  //滚动加载次数
  var scrollLoadTimes = 0;

  var loadChunk = 10;

  var lastItem = $('.items-same .seo-questions-list-item').last().data('aid');

  var $loadBtn = $("#more-sameQ-btn");

  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.scrollLoadMore();
    },

    //获取精选观点
    getSameQuestions: function() {

      var params = {count:loadChunk, moreAId:lastItem, assetId:$loadBtn.data('asset')};

      $loadBtn.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: '/question1/moreSameQuestion',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {

        if( data.result && data.result.qa ) {
          var items = data.result.qa;
          $loadBtn.before( template('question_list', data.result) );
          $loadBtn.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          $loadBtn.data('active','false');

          if(items.length < loadChunk) {
            $loadBtn.remove();
            $(".items-same").append('<p class="no-more">没有更多数据</p>');
            $loadBtn.data('active','true');
          }
          else {
            lastItem = items[items.length-1].aId;
          }
        }
        else {
          $loadBtn.remove();
          $(".items-same").append('<p class="no-more">没有更多数据</p>');
          $loadBtn.data('active','true');
        }

      }).fail(function(data) {
        console.log('fail ajax sameQuestion');
      });
    },

    //滚动加载
    scrollLoadMore: function() {

      $(document).scroll(function() {

        var $windowH = $(window).height(),
            $scrollH = $(document).scrollTop(),
            currentBtnH = 0;

          if(scrollLoadTimes >= 2) {
            return;
          }

          if( $("#more-sameQ-btn").position() ) {
            currentBtnH = $("#more-sameQ-btn").position().top;
          }

          if( ($windowH + $scrollH) >= currentBtnH && $loadBtn.data('active') !== 'true' ) {
            SEMICOLON.initialize.getSameQuestions();
            scrollLoadTimes ++;
            if(scrollLoadTimes === 2) {
              SEMICOLON.initialize.clickLoadMore();
            }
            $loadBtn.data('active','true');
          }


      });
    },

    //点击加载
    clickLoadMore: function() {
      if(scrollLoadTimes >= 2) {
        $loadBtn.click( function() {
          SEMICOLON.initialize.getSameQuestions();
        });
      }
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