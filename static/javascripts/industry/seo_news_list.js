/*
 * 行业事件列表
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
  var industryId = $('#industry-id').val();


  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.scrollLoadMore();
    },

    getMoreItems: function() {
      var $more = $('#get-news-more'),
          params = {};

      $more.html('<img src="/images/loading.gif">正在加载中，请稍候...');

      params['induCode'] = industryId;
      params['count'] = loadChunk;
      params['newsId'] = $more.data('last');

      $.ajax({
        type: 'post',
        url: '/industry/get_events',
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        if(data.code === 0) {
          var items = data.result.news,
              resultHtml = '',
              itemHtml = '';

          $more.data('last', items[items.length - 1].newsId);

          for(var i = 0; i < items.length; i++) {
            itemHtml = '<li class="seo-news-list-item">' +
                    '<dl><dt>' +
                    '<a href="/hangye/' + industryId + '/xinwen/' + items[i].newsId + '" title="' + items[i].title + '" class="qn-post-title-link">' + items[i].title + '</a>' +
                    '</dt><dd>' +
                    '<div class="seo-news-meta">' + $.formatDate(items[i].date, 'MM月dd日 hh:mm:ss') + '</div>' +
                    '</dd></dl>' +
                    '</li>';

            resultHtml += itemHtml;
          }

          $more.parent().before(resultHtml);

          if(items.length < loadChunk) {
            $more.html('没有更多数据');
            $more.unbind('click');
          } else {
            $more.html('显示更多&nbsp;<i class="fa fa-angle-double-down"></i>');
          }
        } else {
          $more.html('加载失败，请重试');
        }
      }).fail(function(data) {
        $more.html('加载失败，请重试');
      });
    },

    //滚动加载
    scrollLoadMore: function() {
      $(document).scroll(function() {
        var windowH = $(window).height(),
            scrollH = $(document).scrollTop(),
            currentBtnH = 0,
            $more = $('#get-news-more'),
            times = $more.data('times');

        if(times >= 2 || $more.length === 0) {
          return;
        }

        currentBtnH = $more.position().top;

        if((windowH + scrollH) >= currentBtnH) {
          SEMICOLON.initialize.getMoreItems();

          times = times + 1;

          $more.data('times', times);

          if(times === 2) {
            SEMICOLON.initialize.clickLoadMore();
          }
        }
      });
    },

    //点击加载
    clickLoadMore: function() {
      var times = $('#get-news-more').data('times');

      if(times >= 2) {
        $('#get-news-more').click( function() {
          SEMICOLON.initialize.getMoreItems();
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
