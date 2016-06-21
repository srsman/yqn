/*
 * 推送
 * @Author: 覃兴军
 */

define([
  'jquery',
  'socket'
], function($, io) {
  'use strict';

  /* 接口 */
  var API = {
    newMsg : '/message/interface_update_check' // 获取消息
  };

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 推送初始化
   * @init: 推送初始化
   * @fetchUnreadNum: 拉取未读消息数
   */
  SEMICOLON.initialize = {

    // 推送初始化
    init: function() {

      var userId = $('#header-user-avatar-box').data('id');

      if(userId) {
        /*
         * 亮至机器：http://192.168.1.129:8182
         * 181：http://192.168.1.181:8182
         * 179：http://192.168.1.179:8182
         * 生产：https://official.yiqiniu.com:7001
         */
        var socket = io.connect('http://192.168.1.129:8182', {reconnection: false});

        //向服务端发送身份识别
        socket.on("connect",function() {
          socket.emit("USER_LOGIN", userId);
        });

        //统一接收推送消息，然后按模块处理
        socket.on("WEB_IPUSH", function(data){
          var dataObj = JSON.parse(data.body);

          if(dataObj.module === 10002){
            SEMICOLON.square.init(dataObj.result);
          }

          if(dataObj.module === 10003){
            SEMICOLON.exclusive.init(dataObj.result);
          }
        });
      }
    },

    /*
    * 拉取未读消息数
    * @text: 消息类型
    * @box: 打点盒子Id
    */
    fetchUnreadNum: function(text, boxId) {

      var userId = $('#header-user-avatar-box').data('id'),
          params = {};

      params['sessionUserId'] = userId;
      params['infList'] = {};
      params['infList'][text] = 0;

      $.niuAjax(API.newMsg, params, function(data) {

        if(data.code === 0 && data.result){
          if(data.result.updInfo){
            var arr = data.result.updInfo;
            for(var i=0; i< arr.length; i++){
              if(arr[i].name === text && arr[i].count !== 0){
                $('#' + boxId).find('.qn-badge').eq(0).text(arr[i].count).removeClass('hide');
              }
            }
          }
        }
      });
    }
  };

  /*
   * 广场问答推送
   * @init: 初始化方法
   * @windowHtml: 弹窗html
   * @rushAction: 抢答
   * @closeAction: 关闭
   */
  SEMICOLON.square = {

    //初始化
    init: function(result) {

      $('.J-push-rush').unbind('click');
      $('.J-push-close').unbind('click');

      //如果需要抢答，则在右下角弹出窗口及个更新左侧数字，如果不需要抢答，则只更新左侧数字。
      if(result.isRush === 'Y'){
        var $ele = $(SEMICOLON.square.windowHtml(result));

        $('body').eq(0).append($ele);
        $ele.animate({bottom: '60px'}, 150);
        SEMICOLON.square.rushAction();
        SEMICOLON.square.closeAction();
      } else{
        //拉取数字
        SEMICOLON.initialize.fetchUnreadNum('get_unread_square_answer', 'newSquareNum');
      }
    },

    // 弹窗html
    windowHtml: function(result) {

      var _html = [];

      _html.push('<div class="qn-pager-wrap push-question">');
      _html.push('<div class="qn-pager-title">');
      _html.push('<div class="pager-title">' + result.title + '</div>');
      _html.push('<ul class="qn-pager-wrap-handle">');
      _html.push('<li><a class="push-question-close J-push-close" hraf="javascript:"><i class="fa fa-times"></i></a>');
      _html.push('</li>');
      _html.push('</ul>');
      _html.push('</div>');
      _html.push('<div class="qn-pager-main">');
      _html.push('<div class="item-user qn-row">');
      _html.push('<div class="qn-avatar">');
      _html.push('<img src="' + $.checkUserIcon(result.qIcon, result.qGender) + '">');
      _html.push('</div>');
      _html.push('<div class="item-user-main">');
      _html.push('<div class="name">' + $.toEmoji(result.qName) + '</div>');
      _html.push('<div class="source">' + result.qAddr + '</div>');
      _html.push('</div>');

      if(result.isRush === 'Y'){
        _html.push('<a data-qid="' + result.qId + '" class="qn-btn sm primary J-push-rush">抢答</a>');
      }

      _html.push('</div>');
      _html.push('<div class="item-question">');

      if(result.assetName){
        _html.push('<div class="item-question-about qn-row">');
        _html.push('<a>' + result.assetName + '</a>');

        if(result.price){
          _html.push('<span>成本价：' + result.price + '元</span>');
        }
        if(result.position){
          _html.push('<span>仓位：' + result.position + '</span>');
        }

        _html.push('</div>');
      }

      _html.push('<div class="item-question-content qn-row">' + $.toEmoji(result.qContent) + '</div>');
      _html.push('</div>');
      _html.push('</div>');
      _html.push('</div>');

      return _html.join('');
    },

    // 抢答
    rushAction: function() {

      $('.J-push-rush').on('click', function(e) {
        e.preventDefault();

        var ele = $(this),
            questionId = ele.data('qid'),
            param = {};

        if(ele.hasClass('locked')){
          return;
        }
        ele.addClass('locked');

        param['qId'] = questionId;
        param['action'] = 'rush';


        $.niuAjax('/question/answer_action', param, function(data) {

          if(data.code === 0){
            ele.addClass('disabled').html('抢答成功');
            SEMICOLON.initialize.fetchUnreadNum('get_unread_square_answer', 'newSquareNum');
          } else{
            ele.addClass('disabled');
            $.niuAlert(data.message);
          }
        }, function(){
          ele.removeClass('locked');
        });
      });
    },

    //关闭
    closeAction: function() {

      $('.J-push-close').on('click', function(e) {
        e.preventDefault();

        $(this).closest('.push-question').animate({bottom: '-200px'},100,function(){
          $(this).remove();
        });
      });
    }
  };

  /*
   * 客户问答推送
   * @init: 初始化方法
   */
  SEMICOLON.exclusive = {

    //初始化
    init: function() {

      //消息打点即可
      SEMICOLON.initialize.fetchUnreadNum('get_unread_exclusive_answer', 'newExclusiveNum');
    }
  };

  /*
   * 消息推送
   * @init: 初始化方法
   */
  SEMICOLON.message = {

    init: function() {

    }
  };

  /*
   * 观点推送
   * @init: 初始化方法
   */
  SEMICOLON.viewpoint = {

    init: function() {

    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化方法
   */
  SEMICOLON.documentOnReady = {

    //初始化
    init: function() {
      SEMICOLON.initialize.init();
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
  //$(document).ready(test);
});