define([
  'jquery'
], function($) {
  'use strict';

  // 调整弹出层位置
  function dialogPosition() {
    var obj = $('.qn-dialog-wrap'),
        wHeight = $(window).height(),
        pHeight = obj.height();

    if(wHeight >= pHeight) {
      obj.css('top', ((wHeight - pHeight) / 2) + 'px');
    } else {
      obj.css('margin-bottom', '120px');
    }
  }

  // 关闭弹窗
  function dialogClose(e) {
    if(e){
      e.preventDefault();
    }

    //$('html').removeClass('qn-dialog-lock');
    $('.qn-dialog-wrap').remove();
    $('.qn-dialog-overlay').fadeOut(function() {
      $(this).remove();
    });
  }

  // 弹窗初始化，解除绑定事件
  function dialogActionInit() {
    $('.qn-dialog-overlay').remove();
    $('.qn-dialog-overlay').unbind('click');
    $('.J-dialog-close').unbind('click');
    $('.J-dialog-cancel').unbind('click');
    $('.J-dialog-sure').unbind('click');
  }

  // 弹窗操作
  function dialogAction(sure, cancel) {
    $('.qn-dialog-overlay').on('click', dialogClose);
    $('.J-dialog-close').on('click', dialogClose);
    if(cancel){
      $('.J-dialog-cancel').on('click', cancel);
    }

    if(sure){
      $('.J-dialog-sure').on('click', sure);
    }
  }

  /*
  * 扩展jquery方法
  * @niuAlert: 弹出窗，有确认按钮
  * @niuNotice: 提示窗，自动关闭
  * @niuConfirm: 确认窗, 需要传递回调函数
  */
  $.extend({

    /*
    * 弹出窗，有确认按钮
    * @text：弹出文字
    */
    niuAlert: function(text) {
      dialogActionInit();

      if(text === 'undefined'){
        text = '';
      }

      var _html = [];

      _html.push('<div class="qn-dialog-overlay"><div class="qn-dialog-wrap">');
      _html.push('<div class="qn-dialog-content text-center">' + text + '</div>');
      _html.push('<div class="qn-dialog-action">');
      _html.push('<div class="col-1"><a href="javascript:;" class="qn-dialog-btn submit J-dialog-close">确定</a></div>');
      _html.push('</div></div>');

      // $('html').addClass('qn-dialog-lock');
      $('body').append(_html.join(''));
      dialogPosition();
      dialogAction();
    },

    /*
    * 提示窗，自动关闭
    * @text: 提示文字
    */
    niuNotice: function(text) {
      dialogActionInit();

      if(text === 'undefined'){
        text = '';
      }

      var _html = [],
          timer;

      _html.push('<div class="qn-dialog-overlay"><div class="qn-dialog-wrap">');
      _html.push('<div class="qn-dialog-content text-center">' + text + '</div>');
      _html.push('</div>');

      // $('html').addClass('qn-dialog-lock');
      $('body').append(_html.join(''));
      dialogPosition();

      //新增了鼠标移入取消自动消失效果
      timer = setTimeout(dialogClose,1500);
      $(".qn-dialog-wrap").on("mouseenter",function(){
        clearTimeout(timer);
      }).on("mouseleave",function(){
        timer = setTimeout(dialogClose,500);
      });
    },

    /*
    * 确认窗
    * @text：确认文字
    * @sure：确认后的回调函数
    */
    niuConfirm: function(text, sure, cancel) {
      dialogActionInit();

      if(text === 'undefined'){
        text = '';
      }

      if(typeof sure !== 'function'){
        sure = function() {
          console.log('你执行了确认操作！');
        };
      }

      if(typeof cancel !== 'function'){
        cancel = dialogClose;
      }

      var _html = [];

      _html.push('<div class="qn-dialog-overlay"><div class="qn-dialog-wrap">');
      _html.push('<div class="qn-dialog-content text-center">' + text + '</div>');
      _html.push('<div class="qn-dialog-action">');
      _html.push('<div class="col-2"><a href="javascript:;" class="qn-dialog-btn cancel border J-dialog-cancel">取消</a></div>');
      _html.push('<div class="col-2"><a href="javascript:;" class="qn-dialog-btn submit J-dialog-sure">确定</a></div>');
      _html.push('</div></div>');

      // $('html').addClass('qn-dialog-lock');
      $('body').append(_html.join(''));
      dialogPosition();
      dialogAction(sure);
    }
  });
});