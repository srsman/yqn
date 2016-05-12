/*
 * 登录
 * @Author: 大发
 */

require([
  'jquery',
  'common',
  'formValidation'
], function($) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 初始化
   * @init: 模块初始化
   * @verifyLoginInfo: 验证登录信息
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.verifyLoginInfo();
      SEMICOLON.initialize.closeLoginError();
    },

    /* 验证登录信息 */
    verifyLoginInfo: function() {
      var rules = {
            username: 'required',
            password: 'required'
          },
          messages = {
            username: '<i class="fa fa-times"></i>用户名不能为空',
            password: '<i class="fa fa-times"></i>密码不能为空'
          },
          submit = function(form) {
            var $submitBox = $('#login-form-submit-box'),
                $submitBtn = $submitBox.find('button[type="submit"]'),
                $form = $(form),
                url = $form.attr('action'),
                type = $form.attr('method').toUpperCase(),
                formData = $.serializeFormObject(form),
                params = {},
                param = {};

            param['certType'] = 0;
            param['certCode'] = formData.username;
            param['pwd'] = formData.password;

            params['params'] = param;

            $.ajax({
              type: type,
              url: url,
              data: JSON.stringify(params),
              dataType: 'json',
              contentType: 'application/json',
              beforeSend: function() {
                // 删除表单中所有的提示
                if($form.find('.qn-alert').length) {
                  $.each($form.find('.qn-alert'), function() {
                    $(this).parent().remove();
                  });
                }

                // 禁用登录按钮
                $submitBtn.attr({'disabled': 'disabled'});
                $submitBtn.html('登录中…');
              }
            }).done(function(data) {


              if(data.code === 0) {
                if(data.result.uType === 2) {
                  // 投顾身份跳转页面
                  window.location.href = '/question/square';
                } else {
                  // 小白身份提示去手机端操作
                  var $errorHtml = $('<div class="qn-popup-overlay">' +
                                '<div class="login-error">' +
                                '<a href="javascript:" class="close-login-error"><i class="fa fa-times"></i></a>' +
                                '</div>' +
                                '</div>');

                  $('html').addClass('qn-popup-lock');
                  $('body').append($errorHtml);

                  $submitBtn.removeAttr('disabled');
                  $submitBtn.html('登录');
                }
              } else {
                var alertHtml = '<div class="qn-form-group special offset-label">';

                alertHtml += $.customAlert(4, data.message) + '</div>';

                $submitBox.before(alertHtml);

                $submitBtn.removeAttr('disabled');
                $submitBtn.html('登录');
              }
            }).fail(function(data) {
              $submitBtn.removeAttr('disabled');
              $submitBtn.html('登录');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              alertHtml += $.customAlert(4, '登录失败，请重试') + '</div>';

              $submitBox.before(alertHtml);
            });
          };

      $.formValidate($('#login-form'), rules, messages, submit);
    },

    closeLoginError: function() {
      $(document).on('click', '.close-login-error', function() {
        $('html').removeClass('qn-popup-lock');
        $('.qn-popup-overlay').remove();
      });
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
