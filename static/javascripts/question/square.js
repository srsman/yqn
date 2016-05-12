/*
 * 广场问答
 * @Author: 覃兴军
 */

require([
  'jquery',
  '/javascripts/question/feed.js',
  'bootstrapSwitch',
  'common',
  'dialog'
], function($, feed) {
  'use strict';

  /* 接口 */
  var API = {
    getSwitch : '/question/get_adviser_switch', //获取开关值
    setSwitch : '/question/set_adviser_switch', //设置开关值
    statistic : '/question/qa_statistic_data' //获取统计数据
  };

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 问答列表
   * @init: 初始化
   * @qStatusFilter: 状态筛选
   * @isSatisfyFilter: 评价筛选
   */
  SEMICOLON.list = {

    // 初始化
    init: function() {
      this.qStatusFilter();
      this.isSatisfyFilter();
      feed.checkQuestionId();
      feed.rushAction();
      feed.refuseAction();
      feed.giveupAction();
      feed.answerAction(SEMICOLON.statistic.getStatisticsData);
      feed.scrollLoadMore(1);
      feed.clickLoadMore(1);
      feed.textareaHeight();
    },

    //状态筛选
    qStatusFilter: function() {

      $('#qStatusFilter > a').on('click', function(e) {
        e.preventDefault();

        var $this = $(this);
        $this.siblings('a').removeClass('active');
        $this.addClass('active');

        if($this.data('status') === 2){
          $('#isSatisfyFilter').parent().slideDown(150);
        } else{
         $('#isSatisfyFilter').parent().slideUp(150);
          $('#isSatisfyFilter > a').removeClass('active');
          $('#isSatisfyFilter > a').first().addClass('active');
        }

        feed.listFeed(1);
      });
    },

    //评价筛选
    isSatisfyFilter: function() {

      $('#isSatisfyFilter > a').on('click', function(e) {
        e.preventDefault();

        var $this = $(this);
        $this.siblings('a').removeClass('active');
        $this.addClass('active');
        feed.listFeed(1);
      });
    }
  };

  /*
   * 统计数据
   * @init: 初始化
   * @getStatisticsData: 获取统计数据
   * @getSwitch: 获取开关
   * @setSwitch: 设置开关
   */
  SEMICOLON.statistic = {

    // 初始化
    init: function() {

      this.getStatisticsData();
      this.getSwitch();
    },

    //获取统计数据
    getStatisticsData: function() {

      var params = {};

          params['type'] = 1;

      $.niuAjax(API.statistic, params, function(data) {

        if(data.code === 0){

          var obj = data.result;

          $('#qTotalNum').removeClass('no-data').text(obj.total);
          $('#qTodayNum').removeClass('no-data').text(obj.dayTotal);
          $('#qSatisfiedRate').removeClass('no-data').text(obj.satisfiedRate);
          $('#qSignContractNum').removeClass('no-data').text(obj.signContractNum);
        }
      });
    },

    //获取开关
    getSwitch: function() {

      var params = {};

          params['flag'] = 2;

      $.niuAjax(API.getSwitch, params, function(data) {

        if(data.code === 0){

          var _html = [];

          if(data.result.value === 'Y'){
            _html.push('<div class="header-switch-text"><div class="qn-alert info"><i class="fa fa-info"></i>您已开启问答服务，请及时回复客户问题哦~</div></div>');
            _html.push('<div class="header-switch">');
            _html.push('<input id="switchBtn" type="checkbox" data-on="success" data-off="warning" checked>');
            _html.push('</div>');
          } else{
            _html.push('<div class="header-switch-text"><div class="qn-alert warning"><i class="fa fa-info"></i>您已关闭问答服务，好多客户与您擦肩而过哦~</div></div>');
            _html.push('<div class="header-switch">');
            _html.push('<input id="switchBtn" type="checkbox" data-on="success" data-off="warning">');
            _html.push('</div>');
          }

          $('#switchWrap').empty().append(_html.join('')).fadeIn();
          $('#switchBtn').bootstrapSwitch();

          SEMICOLON.statistic.setSwitch();
        } else{
          console.log('通信错误');
        }
      });
    },

    //设置开关
    setSwitch: function() {

      $('#switchBtn').on('switchChange.bootstrapSwitch', function (event, state) {

        var params = {};

        params['value'] = state ? 'Y' : 'N';
        params['flag'] = 2;

        if(state === false){
         // $.niuConfirm('你确认关闭问答服务吗');
          $('.header-switch-text').html('<div class="qn-alert warning"><i class="fa fa-info"></i>您已关闭问答服务，好多客户与您擦肩而过哦~</div>');
        } else{
          $('.header-switch-text').html('<div class="qn-alert info"><i class="fa fa-info"></i>您已开启问答服务，请及时回复客户问题哦~</div>');
        }

        $.niuAjax(API.setSwitch, params, function(data) {

          if(data.code !== 0){
            $.niuAlert(data.message);
          }
        });
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