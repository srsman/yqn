/*
 * 观点列表
 * @Author: 游行至
 */

require([
  'jquery',
  'common'
], function ($, viewpoint_common) {
  'use strict';

  /* 接口 */
  var API = {
    list: '/viewpoint/list', // 观点列表
    delAction: '/viewpoint/delete', // 删除观点
    statistic:'/viewpoint/statistic' // 观点统计
  };

  /* 最新拉取的观点ID */
  var lastViewpointId = $('.feed-item').last().data('id');

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  // 摘要长度
  var summaryLen = 137;

  /*
  * 观点列表
  * @init: 初始化
  * @getViewpoints: 观点列表
  * @scrollLoadMore: 滚动加载更多
  * @clickLoadMore: 点击加载更多
  * @showDeleteBtn: 鼠标移入显示删除按钮
  * @deleteViewpoint: 删除观点
  */
  SEMICOLON.list = {

    // 初始化
    init: function(){
      this.scrollLoadMore();
      this.clickLoadMore();
      this.showDeleteBtn();
      this.deleteViewpoint();
    },

    // 观点列表
    getViewpoints: function(ajaxLoading,more) {

      // 初始化参数
      var params = {};
      params['count'] = 10;
      params['readId'] = lastViewpointId;


      $.niuAjax(API.list, params, function (data) {

        if (data.code === 0) {//请求成功
          // 请求成功且有数据返回
          if ((typeof data.result !== 'undefined') && (typeof data.result.data !== 'undefined')) {
            var _html = '';

            // 循环添加li元素
            var viewpoints = data.result.data;
            for (var i = 0; i < viewpoints.length; i++) {

              _html += '<div data-tt="Y" data-id="' + viewpoints[i].viewpointId + '" class="feed-item">';
              _html += '<div class="qn-row row item-head">';
              _html += '<i class="icon-viewpoint"></i>';
              _html += '<div class="col-xs-8">';
              _html += '<div class="viewpoint-title">';
              _html += '<a href="/viewpoint/detail/' + viewpoints[i].viewpointId + '">' + $.toEmoji(viewpoints[i].title.stringFilter()) + '</a>';

              // 如果加精
              if(viewpoints[i].isSelection === 1){
                _html += '<i class="icon-elite">精</i>';
              }

              _html += '</div>';
              _html += '</div>';
              _html += '<div class="col-xs-4">';
              _html += '<div class="viewpoint-meta"><span>' + viewpoints[i].viewpointTs + '</span><span>阅读：' + viewpoints[i].readNum + '</span></div>';
              _html += '</div>';
              _html += '</div>';
              _html += '<div class="qn-row item-artice">';
              _html += '<div class="row">';

              // 截断摘要，摘要可能为空
              var summary = '';
              summary = typeof viewpoints[i].summary === "undefined" ? "" : viewpoints[i].summary;
              summary = summary.niuStrSub(summaryLen);
              // 如果firstImg为空
              if(typeof viewpoints[i].firstImg === 'undefined'){
                _html += '<div class="col-xs-12">' + $.toEmoji(summary) + '</div>';
              } else{
                _html += '<div class="col-xs-3">';
                _html += '<img src="' + viewpoints[i].firstImg + '" />';
                _html += '</div>';
                _html += '<div class="col-xs-9">' + $.toEmoji(summary) + '</div>';
              }

              _html += '</div>';
              _html += '</div>';
              _html += '<div class="item-foot row qn-row">';
              _html += '<div class="col-xs-12 item-foot-action">';

              if(viewpoints[i].isMine){
                _html += '<a href="javascript:;" class="foot-delete hide"><i class="fa fa-trash-o"></i>删除</a>';
              }

              _html += '<a href="/viewpoint/detail/' + viewpoints[i].viewpointId + '">' + viewpoints[i].commentNum + '条评论</a>';
              _html += '<a href="/viewpoint/detail/' + viewpoints[i].viewpointId + '">' + viewpoints[i].likeNum + '个赞</a>';
              _html += '</div>';
              _html += '</div>';
              _html += '</div>';
            }

            // 将最后的观点id赋值给lastViewpointId
            lastViewpointId = viewpoints[viewpoints.length - 1].viewpointId;

            // 将列表添加到ul标签后
            $('.viewpoint-feed').append(_html);

            // 处理加载图片
            if (more) {//拉取更多成功

              var count = $(ajaxLoading).data('count');
              count += 1;

              $(ajaxLoading).data('count', count);

              if (count >= 2) {
                $(ajaxLoading).html('点击加载更多');
              }

              if (viewpoints.length < 10) {
                $(ajaxLoading).html('没有更多').data('over', 'Y');
              }
            } else {//第一次请求成功
              $(ajaxLoading).addClass('hide');
              // 如果第一次请求就为空
              if (viewpoints.length === 0) {
                $(ajaxLoading).data('null', 'Y');
              }
            }
          }else{//请求成功，返回数据为空

          }

        }else{//请求失败
          if (more) {//拉取更多失败
            $(ajaxLoading).html('没有更多').data('over', 'Y');
          } else {//第一次拉取失败

            $(ajaxLoading).data('null', 'Y');
            $(ajaxLoading).addClass('hide');
          }
        }
        // 解除重发锁定
        $(ajaxLoading).data('active', 'N');
      });
    },

    // 滑动加载更多
    scrollLoadMore: function () {

      $(window).scroll(function () {

        var ajaxLoading = "#ajaxLoading";

        var scrollTop = $(window).scrollTop(),
          scrollHeight = $(document).height(),
          windowHeight = $(window).height(),
          loadCount = $(ajaxLoading).data('count'),
          isNull = $(ajaxLoading).data('null'),
          over = $(ajaxLoading).data('over'),
          active = $(ajaxLoading).data('active');

        // 如果没有东西
        if (isNull === 'Y') {
          $(ajaxLoading).addClass('hide');
          return;
        }

        //- 如果不为空，并且滚动达到高度时拉新
        if (((scrollTop + windowHeight) === scrollHeight)) {

          if (loadCount < 2 && over !== 'Y') {
            $(ajaxLoading).removeClass('hide');

            // 防止重发
            if (active === 'Y') {
              return;
            }

            setTimeout(function () {
              SEMICOLON.list.getViewpoints(ajaxLoading, true);
            }, 1000);

            $(ajaxLoading).data('active', 'Y');
          }
        }
      });
    },

    // 点击加载更多
    clickLoadMore: function () {
      $(document).on('click', function () {

        // 获取当前操作的tab页
        var ajaxLoading = "#ajaxLoading";

        var over = $(ajaxLoading).data('over'),
          isNull = $(ajaxLoading).data('null'),
          active = $(ajaxLoading).data('active');

        if (isNull === 'Y') {
          $(ajaxLoading).addClass('hide');
          return;
        }

        if (over === 'Y' || active === 'Y') {
          return;
        }

        $(ajaxLoading).html('<img src="/images/loading.gif">正在加载中，请稍候...');
        setTimeout(function () {
          SEMICOLON.list.getViewpoints(ajaxLoading, true);
        }, 1000);

        $(ajaxLoading).data('active', 'Y');
      });
    },

    // 鼠标移入显示删除按钮
    showDeleteBtn: function() {

      $(document).on('mouseover', '.feed-item', function() {
        $('.foot-delete', this).removeClass('hide');
      }).on('mouseout', '.feed-item', function() {
        $('.foot-delete', this).addClass('hide');
      });
    },

    // 删除观点
    deleteViewpoint: function () {

      $(document).on('click', '.foot-delete', function (e) {
        e.preventDefault();

        var ele = $(this),
            item = ele.closest('.feed-item'),
            title = item.find('.viewpoint-title > a').html();

        $.niuConfirm('确定删除<b>' + title + '</b>？', function() {

          var params = {};

          params['type'] = 'P';
          params['id'] = item.data('id');

          $.niuAjax(API.delAction, params, function (data) {

            if (data.code === 0) {
              item.remove();
              SEMICOLON.statistic.getStatisticsData();

              // 如果没有观点了，则添加“没有观点”的图片提示
              if($(".feed-item").length === 0) {
                $(".qn-section.viewpoint-feed").append('<div class="qn-no-result"><ul><li><img src="/images/list_null.png" height="106"></li><li>暂无观点！</li></ul></div>');
              }
            } else{
              $.niuAlert(data.message);
            }
          });
        });
      });
    }
  };

  /*
  * 静态数据加载
  * @init：初始化
  * @getStatisticsData: 统计数据
  */
  SEMICOLON.statistic = {

    // 初始化
    init: function() {
      this.getStatisticsData();
    },

    // 统计数据
    getStatisticsData: function() {

      var param = {};

      $.niuAjax(API.statistic, param, function(data) {
        if(data.code === 0){
          if(data.result){
            $('#totalNum').removeClass('no-data').text(data.result.totalNum);
            $('#todayNum').removeClass('no-data').text(data.result.todayNum);
          }
        } else{
          $.niuNotice(data.message);
        }
      });
    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化
   */
  SEMICOLON.documentOnReady = {

    //初始化
    init: function() {
      SEMICOLON.list.init();
      SEMICOLON.statistic.init();
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});
