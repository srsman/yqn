/*
 * 观点列表
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
    'featured' : 0,
    'hot' : 0
  };

  var loadChunk = 10;

  var lastViewpoint = {
    'featured' : $('.items-featured .viewpoint-item').last().data('mid'),
    'hot' : $('.items-hot .viewpoint-item').last().data('mid')
  };

  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.scrollLoadMore();
    },

    //获取精选观点
    getFeaturedVps: function() {

      var $loadBtn = $("#more-featuredVP-btn");
      var params = {count:loadChunk, readId:lastViewpoint.featured};

      $loadBtn.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: '/viewpoint1/featuredVPs',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {

        if( data.result && data.result.data ) {
          var viewpoints = data.result.data;
          $loadBtn.before( template('viewpoint_list', data.result) );
          $loadBtn.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          $('#featured').data('active','false');

          if(viewpoints.length < loadChunk) {
            $("#more-featuredVP-btn").remove();
            $(".items-featured").append('<p class="no-more">没有更多数据</p>');
            $('#featured').data('active','true');
          }
          else {
            lastViewpoint.featured = viewpoints[viewpoints.length-1].viewpointId;
          }
        }
        else {
          $("#more-featuredVP-btn").remove();
          $(".items-featured").append('<p class="no-more">没有更多数据</p>');
          $('#featured').data('active','true');
        }

      }).fail(function(data) {
        console.log('fail ajax featuredVPs');
      });
    },

    //获取人气观点
    getHotVps: function() {

      var $loadBtn = $("#more-hotVP-btn");
      var params = {count:loadChunk, readId:lastViewpoint.hot, type:'P'};

      $loadBtn.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: '/viewpoint1/hotVPs',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        var $hotInput = $('#hot');

        if(data.result && data.result.data) {
          var viewpoints = data.result.data;

          $loadBtn.before( template('viewpoint_list', data.result) );
          $loadBtn.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          $hotInput.data('active','false');

          if(viewpoints.length < loadChunk) {
            $("#more-hotVP-btn").remove();
            $(".items-hot").append('<p class="no-more">没有更多数据</p>');
            $hotInput.data('active', 'true');
          } else {
            lastViewpoint.hot = viewpoints[viewpoints.length-1].viewpointId;
          }
        } else {
          $("#more-hotVP-btn").remove();
          $(".items-hot").append('<p class="no-more">没有更多数据</p>');
          $hotInput.data('active', 'true');
        }

      }).fail(function(data) {
        console.log('fail ajax hotVps');
      });
    },

    //滚动加载
    scrollLoadMore: function() {

      $(document).scroll(function() {

        var $windowH = $(window).height(),
            $scrollH = $(document).scrollTop(),
            $featuredBtn = $('#featured'),
            $hotBtn = $('#hot'),
            currentBtnH = 0;

        if($featuredBtn.is(':checked')) {

          if(scrollLoadTimes.featured >= 2) {
            return;
          }
          //当前在【精选观点】tab
          currentBtnH = $("#more-featuredVP-btn").position().top;
          if( ($windowH + $scrollH) >= currentBtnH && $featuredBtn.data('active') !== 'true' ) {
            SEMICOLON.initialize.getFeaturedVps();
            scrollLoadTimes.featured ++;
            if(scrollLoadTimes.featured === 2) {
              SEMICOLON.initialize.clickLoadMore();
            }
            $featuredBtn.data('active','true');
          }
        }
        else if($hotBtn.is(':checked')) {

          if(scrollLoadTimes.hot >= 2) {
            return;
          }
          //当前在【人气观点】tab
          currentBtnH = $("#more-hotVP-btn").position().top;
          if( ($windowH + $scrollH) >= currentBtnH && $hotBtn.data('active') !== 'true' ) {
            SEMICOLON.initialize.getHotVps();
            scrollLoadTimes.hot ++;
            if(scrollLoadTimes.hot === 2) {
              SEMICOLON.initialize.clickLoadMore();
            }
            $hotBtn.data('active','true');
          }
        }
      });
    },

    //点击加载
    clickLoadMore: function() {
      if(scrollLoadTimes.featured >= 2) {
        $('#more-featuredVP-btn').click( function() {
          SEMICOLON.initialize.getFeaturedVps();
        });
      }
      if(scrollLoadTimes.hot >= 2) {
        $('#more-hotVP-btn').click( function() {
          SEMICOLON.initialize.getHotVps();
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