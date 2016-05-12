/*
 * 客户问答
 * @Author: 覃兴军
 */

require([
  'jquery',
  '/javascripts/question/feed.js',
  'common'
], function($, feed) {
  'use strict';

  /* 接口 */
  var API = {
    statistic : '/question/qa_statistic_data' //获取统计数据
  };

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 问答列表
   * @init: 初始化
   * @qStatusFilter: 状态筛选
   */
  SEMICOLON.list = {

    // 初始化
    init: function() {
      this.qStatusFilter();
      feed.checkQuestionId();
      feed.rushAction();
      feed.refuseAction();
      feed.giveupAction();
      feed.answerAction(SEMICOLON.statistic.getStatisticsData);
      feed.scrollLoadMore(2);
      feed.clickLoadMore(2);
      feed.textareaHeight();
    },

    //状态筛选
    qStatusFilter: function() {

      $('#qStatusFilter > a').on('click', function(e) {
        e.preventDefault();

        var $this = $(this);
        $this.siblings('a').removeClass('active');
        $this.addClass('active');

        feed.listFeed(2);
      });
    }
  };

  /*
   * 统计数据
   * @init: 初始化
   * @getStatisticsData: 获取统计数据
   */
  SEMICOLON.statistic = {

    // 初始化
    init: function() {

      this.getStatisticsData();
    },

    //获取统计数据
    getStatisticsData: function() {

      var params = {};

          params['type'] = 2;

      $.niuAjax(API.statistic, params, function(data) {

        if(data.code === 0){

          var obj = data.result;

          $('#qTotalNum').removeClass('no-data').text(obj.total);
          $('#qTodayNum').removeClass('no-data').text(obj.dayTotal);
          $('#qSatisfiedRate').removeClass('no-data').text(obj.satisfiedRate);
          $('#qSignContractNum').removeClass('no-data').text(obj.signContractNum);
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
      SEMICOLON.statistic.init();
      SEMICOLON.list.init();
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});