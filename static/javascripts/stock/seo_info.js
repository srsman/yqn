/*
 * 股票详情
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

  //每次加载的数据个数
  var loadChunk = 10;

  // 当前股票ID
  var stockId = $('#stock-id').val();

  var map = [];

  function init(arr) {
    var length = arr.length;

    if(length<1) {
      return;
    }

    for(var i=0; i<length; i++) {
      var $items = $('#items-stock-'+arr[i]);

      map.push({
        name: arr[i],
        lastItem: $items.find('.item').last().data('mid'),
        scrollLoadTimes: 0,
        moreItemBtn: $items.find('.more-items'),
        radioBtn: $('#stock-'+arr[i]),
      });
    }
  }

  var tabs = ['news','notice', 'question', 'viewpoint'];

  init(tabs);

  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.scrollLoadMore();
    },

    getMoreItems: function(target) {

      var more = target.moreItemBtn,
          last = target.lastItem,
          btn = target.radioBtn,
          name = target.name,
          params = {},
          url = '';

      switch(name) {
        case 'news':
          params = { assetId:stockId, type:1, count:loadChunk, artid:last};
          url = '/stock/moreNews';
          break;
        case 'notice':
          params = { assetId:stockId, type:2, count:loadChunk, artid:last};
          url = '/stock/moreNews';
          break;
        case 'question':
          params = { assetId:stockId, count:loadChunk, moreAId:last };
          url = '/stock/moreQuestion';
          break;
        case 'viewpoint':
          params = { assetId:stockId, type:'S', count:loadChunk, readId:last };
          url = '/stock/moreViewpoint';
          break;
      }

      more.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      $.ajax({
        type: 'post',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {

        //对于没返回数据的结果异常处理
        if(data.result && (data.result.qa || data.result.data) ) {
          var items;

          if(name === 'news' || name === 'notice') {
            items = data.result.data;
            more.before( template('news_list', data.result) );
          }
          else if(name === 'question'){
            items = data.result.qa;
            more.before( template('question_list', data.result) );
          }
          else if(name === 'viewpoint'){
            items = data.result.data;
            more.before( template('viewpoint_list', data.result) );
          }
          more.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          btn.data('active','false');

          if(items.length < loadChunk) {
            more.before('<p class="no-more">没有更多数据</p>');
            more.remove();
            btn.data('active','true');
          }
          else {
            switch(name) {
              case 'news':
                target.lastItem = items[items.length-1].artid;
                break;
              case 'notice':
                target.lastItem = items[items.length-1].artid;
                break;
              case 'question':
                target.lastItem = items[items.length-1].aId;
                break;
              case 'viewpoint':
                target.lastItem = items[items.length-1].viewpointId;
                break;
            }
          }
        }
        else {
          more.before('<p class="no-more">没有更多数据</p>');
          more.remove();
          btn.data('active','true');
        }


      }).fail(function(data) {
        console.log('fail ajax zuixinQuestion');
      });
    },

    //滚动加载
    scrollLoadMore: function() {

      $(document).scroll(function() {

        var $windowH = $(window).height(),
            $scrollH = $(document).scrollTop(),
            currentBtnH = 0;

        var length = map.length;
        for( var i = 0; i<length; i++ ) {
          if(map[i].radioBtn.is(':checked')) {

            var o = map[i],
                btn = o.radioBtn,
                more = o.moreItemBtn,
                times = o.scrollLoadTimes;

            if( times >= 2 || more.length === 0) {
              return;
            }

            currentBtnH = more.position().top;

            if( ($windowH + $scrollH) >= currentBtnH && btn.data('active') !== 'true' ) {
              SEMICOLON.initialize.getMoreItems(map[i]);
              o.scrollLoadTimes++;
              if( o.scrollLoadTimes === 2) {
                SEMICOLON.initialize.clickLoadMore();
              }
              btn.data('active','true');
            }

            break;
          }
        }
      });

    },

    //点击加载
    clickLoadMore: function() {


      if(map[0].scrollLoadTimes >= 2) {
        map[0].moreItemBtn.click( function() {
          SEMICOLON.initialize.getMoreItems(map[0]);
        });
      }

      if(map[1].scrollLoadTimes >= 2) {
        map[1].moreItemBtn.click( function() {
          SEMICOLON.initialize.getMoreItems(map[1]);
        });
      }

      if(map[2].scrollLoadTimes >= 2) {
        map[2].moreItemBtn.click( function() {
          SEMICOLON.initialize.getMoreItems(map[2]);
        });
      }

      if(map[3].scrollLoadTimes >= 2) {
        map[3].moreItemBtn.click( function() {
          SEMICOLON.initialize.getMoreItems(map[3]);
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