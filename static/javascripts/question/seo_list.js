/*
 * 问答列表
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
  var scrollLoadTimes = {
    'zuixin' : 0,
    'gupiao' : 0,
    'dapan' : 0
  };

  //每次加载的数据个数
  var loadChunk = 8;

  var lastItem = {
    'zuixin' : $('.items-zuixin .seo-questions-list-item').last().data('mid'),
    'gupiao' : $('.items-gupiao .seo-questions-list-item').last().data('mid'),
    'dapan' : $('.items-dapan .seo-questions-list-item').last().data('mid')
  };

  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.scrollLoadMore();
    },

    //获取最新问题
    getZXquestions: function() {

      var $loadBtn = $("#more-zuixin-btn");
      var params = {count:loadChunk, moreAId:lastItem.zuixin};

      $loadBtn.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: '/question1/moreQuestion',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {

        if( data.result && data.result.qa ) {
          var items = data.result.qa;
          $loadBtn.before( template('question_list', data.result) );
          $loadBtn.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          $('#zuixin').data('active','false');

          if(items.length < loadChunk) {
            $("#more-zuixin-btn").remove();
            $(".items-zuixin").append('<p class="no-more">没有更多数据</p>');
            $('#zuixin').data('active','true');
          }
          else {
            lastItem.zuixin = items[items.length-1].aId;
          }
        }
        else {
          $("#more-zuixin-btn").remove();
          $(".items-zuixin").append('<p class="no-more">没有更多数据</p>');
          $('#zuixin').data('active','true');
        }

      }).fail(function(data) {
        console.log('fail ajax zuixinQuestion');
      });
    },

    //获取股票问题
    getGPquestions: function() {

      var $loadBtn = $("#more-gupiao-btn");
      var params = {count:loadChunk, moreAId:lastItem.gupiao, qType:1};

      $loadBtn.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: '/question1/moreQuestion',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {

        if( data.result && data.result.qa ) {
          var items = data.result.qa;
          $loadBtn.before( template('question_list', data.result) );
          $loadBtn.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          $('#gupiao').data('active','false');

          if(items.length < loadChunk) {
            $("#more-gupiao-btn").remove();
            $(".items-gupiao").append('<p class="no-more">没有更多数据</p>');
            $('#gupiao').data('active','true');
          }
          else {
            lastItem.gupiao = items[items.length-1].aId;
          }
        }
        else {
          $("#more-gupiao-btn").remove();
          $(".items-gupiao").append('<p class="no-more">没有更多数据</p>');
          $('#gupiao').data('active','true');
        }

      }).fail(function(data) {
        console.log('fail ajax gupiaoQuestion');
      });
    },

    //获取最新问题
    getDPquestions: function() {

      var $loadBtn = $("#more-dapan-btn");
      var params = {count:loadChunk, moreAId:lastItem.dapan, qType:2};

      $loadBtn.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: '/question1/moreQuestion',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {

        if( data.result && data.result.qa ) {
          var items = data.result.qa;
          $loadBtn.before( template('question_list', data.result) );
          $loadBtn.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          $('#dapan').data('active','false');

          if(items.length < loadChunk) {
            $("#more-dapan-btn").remove();
            $(".items-dapan").append('<p class="no-more">没有更多数据</p>');
            $('#dapan').data('active','true');
          }
          else {
            lastItem.dapan = items[items.length-1].aId;
          }
        }
        else {
          $("#more-dapan-btn").remove();
          $(".items-dapan").append('<p class="no-more">没有更多数据</p>');
          $('#dapan').data('active','true');
        }

      }).fail(function(data) {
        console.log('fail ajax dapanQuestion');
      });
    },


    //滚动加载
    scrollLoadMore: function() {

      $(document).scroll(function() {

        var $windowH = $(window).height(),
            $scrollH = $(document).scrollTop(),
            $zuixinBtn = $('#zuixin'),
            $gupiaoBtn = $('#gupiao'),
            $dapanBtn = $('#dapan'),
            currentBtnH = 0;

        //当前在【最新问题】tab
        if($zuixinBtn.is(':checked')) {

          if(scrollLoadTimes.zuixin >= 2) {
            return;
          }

          currentBtnH = $("#more-zuixin-btn").position().top;
          if( ($windowH + $scrollH) >= currentBtnH && $zuixinBtn.data('active') !== 'true' ) {
            SEMICOLON.initialize.getZXquestions();
            scrollLoadTimes.zuixin ++;
            if(scrollLoadTimes.zuixin === 2) {
              SEMICOLON.initialize.clickLoadMore();
            }
            $zuixinBtn.data('active','true');
          }
        }

        //当前在【股票问题】tab
        else if($gupiaoBtn.is(':checked')) {

          if(scrollLoadTimes.gupiao >= 2) {
            return;
          }

          currentBtnH = $("#more-gupiao-btn").position().top;
          if( ($windowH + $scrollH) >= currentBtnH && $gupiaoBtn.data('active') !== 'true' ) {
            SEMICOLON.initialize.getGPquestions();
            scrollLoadTimes.gupiao ++;
            if(scrollLoadTimes.gupiao === 2) {
              SEMICOLON.initialize.clickLoadMore();
            }
            $gupiaoBtn.data('active','true');
          }
        }

        //当前在【大盘问题】tab
        else if($dapanBtn.is(':checked')) {

          if(scrollLoadTimes.dapan >= 2) {
            return;
          }

          currentBtnH = $("#more-dapan-btn").position().top;
          if( ($windowH + $scrollH) >= currentBtnH && $dapanBtn.data('active') !== 'true' ) {
            SEMICOLON.initialize.getDPquestions();
            scrollLoadTimes.dapan ++;
            if(scrollLoadTimes.dapan === 2) {
              SEMICOLON.initialize.clickLoadMore();
            }
            $dapanBtn.data('active','true');
          }
        }
      });
    },

    //点击加载
    clickLoadMore: function() {
      if(scrollLoadTimes.zuixin >= 2) {
        $('#more-zuixin-btn').click( function() {
          SEMICOLON.initialize.getZXquestions();
        });
      }
      if(scrollLoadTimes.gupiao >= 2) {
        $('#more-gupiao-btn').click( function() {
          SEMICOLON.initialize.getGPquestions();
        });
      }
      if(scrollLoadTimes.dapan >= 2) {
        $('#more-dapan-btn').click( function() {
          SEMICOLON.initialize.getDPquestions();
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