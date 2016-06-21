/*
 * 登录
 * @Author: 大发
 */

require([
  'jquery',
  'sui',
  'functions'
], function($) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  var loginUrl = '/account/login';

  /*
   * 初始化
   * @init: 模块初始化
   * @verifyLoginInfo: 验证登录信息
   */
  SEMICOLON.initialize = {
    init: function() {
      /*---- 重写登录 ----*/
      this.loginRule();
      this.updateCaptcha();
      this.bindInputFocus();
      this.closeLoginError();
      /*
      SEMICOLON.initialize.verifyLoginInfo();
      SEMICOLON.initialize.closeLoginError();
      */
    },

    // 设置cookie参数
    setCookie: function(ms) {
      var date = new Date();
      date.setTime(date.getTime() + ms);
      return {expires: date, path: '/', secure: false};
    },

    /* 绑定input获取焦点事件 */
    bindInputFocus: function() {
      $('input').on('focus', function() {
        SEMICOLON.initialize.clearError();
      });
    },

    /* 去掉错误信息 */
    clearError: function() {
      $('.qn-alert').remove();
      $('.qn-form-group.special.offset-label').remove();
    },

    /* 刷新验证码 */
    updateCaptcha: function () {
      $('#captcha,#updateCap').on('click', function () {
        $('#captcha').attr('src', '/captcha?time=' + (+new Date()));
      });
    },

    /*  登录验证规则 */
    loginRule: function() {
      // 验证手机
      $.validate.setRule('tel',function(value,element,param){
        return /^\d{11}$/.test(value);
      },'请填写正确的手机号码');

      $('#login-form').validate({
        rules: {
          username: {
            required: true,
            tel: true
          },
          password: {
            required: true
          },
          captcha: {
            required: true
          }
        },
        success: function() {
          // 清除错误
          SEMICOLON.initialize.clearError();

          var $submitBox = $('#login-form-submit-box'),
            $submitBtn = $submitBox.find('button[type="submit"]'),
            $form = $('#login-form'),
            url = loginUrl,
            type = $form.attr('method').toUpperCase(),
            formData = $.serializeFormObject('#login-form'),
            params = {},
            param = {};

          param['certType'] = 0;
          param['certCode'] = formData.username;
          param['pwd'] = formData.password;
          param['captcha'] = formData.captcha;

          params['params'] = param;

          $.ajax({
            type: type,
            url: url,
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
            beforeSend: function() {
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
            }
            else {
              var alertHtml = '<div class="qn-form-group special offset-label">';

              alertHtml += $.customAlert(4, data.message) + '</div>';

              $submitBox.before(alertHtml);

              $submitBtn.removeAttr('disabled');
              $submitBtn.html('登录');

              var $captcha = $('#captcha');
              // 是否需要验证码
              if (data.showCaptcha) {
                if ($captcha.length < 1) {
                  var captchaHtml = '';
                  captchaHtml += '<label for="inputCaptcha" class="qn-control-label">验证码</label>';
                  captchaHtml += '<div class="qn-form-control-box controls-wrap">';
                  captchaHtml += ' <input id="inputCaptcha" type="text" name="captcha" placeholder="请填写验证码" tabindex="3" class="qn-form-control qn-form-captcha">';
                  captchaHtml += '<img id="captcha" src="/captcha" class="captcha m-l-5">';
                  captchaHtml += '<a id="updateCap" href="javascript:void(0);" class="link-blue m-l-5">换一张</a>';
                  captchaHtml += '<div class="clearfix"></div>';
                  captchaHtml += '</div>';
                  $('#capContainer').html(captchaHtml);
                  SEMICOLON.initialize.loginRule();
                  SEMICOLON.initialize.bindInputFocus();
                  SEMICOLON.initialize.updateCaptcha();
                }
              }
              // 刷新验证码
              console.log($captcha.length);
              if ($captcha.length > 0) {
                $captcha.trigger('click');
              }
            }
          }).fail(function(data) {
            $submitBtn.removeAttr('disabled');
            $submitBtn.html('登录');

            var alertHtml = '<div class="qn-form-group special offset-label">';

            alertHtml += $.customAlert(4, '登录失败，请重试') + '</div>';

            $submitBox.before(alertHtml);
          });
          return false;
        }
      });
    },

    /* 验证登录信息 */
    //verifyLoginInfo: function() {
    //  var rules = {
    //        username: 'required',
    //        password: 'required'
    //      },
    //      messages = {
    //        username: '<i class="fa fa-times"></i>用户名不能为空',
    //        password: '<i class="fa fa-times"></i>密码不能为空'
    //      },
    //      submit = function(form) {
    //        var $submitBox = $('#login-form-submit-box'),
    //            $submitBtn = $submitBox.find('button[type="submit"]'),
    //            $form = $(form),
    //            url = $form.attr('action'),
    //            type = $form.attr('method').toUpperCase(),
    //            formData = $.serializeFormObject(form),
    //            params = {},
    //            param = {};
    //
    //        param['certType'] = 0;
    //        param['certCode'] = formData.username;
    //        param['pwd'] = formData.password;
    //
    //        params['params'] = param;
    //
    //        $.ajax({
    //          type: type,
    //          url: url,
    //          data: JSON.stringify(params),
    //          dataType: 'json',
    //          contentType: 'application/json',
    //          beforeSend: function() {
    //            // 删除表单中所有的提示
    //            if($form.find('.qn-alert').length) {
    //              $.each($form.find('.qn-alert'), function() {
    //                $(this).parent().remove();
    //              });
    //            }
    //
    //            // 禁用登录按钮
    //            $submitBtn.attr({'disabled': 'disabled'});
    //            $submitBtn.html('登录中…');
    //          }
    //        }).done(function(data) {
    //
    //
    //          if(data.code === 0) {
    //            if(data.result.uType === 2) {
    //              // 投顾身份跳转页面
    //              window.location.href = '/question/square';
    //            } else {
    //              // 小白身份提示去手机端操作
    //              var $errorHtml = $('<div class="qn-popup-overlay">' +
    //                            '<div class="login-error">' +
    //                            '<a href="javascript:" class="close-login-error"><i class="fa fa-times"></i></a>' +
    //                            '</div>' +
    //                            '</div>');
    //
    //              $('html').addClass('qn-popup-lock');
    //              $('body').append($errorHtml);
    //
    //              $submitBtn.removeAttr('disabled');
    //              $submitBtn.html('登录');
    //            }
    //          } else {
    //            var alertHtml = '<div class="qn-form-group special offset-label">';
    //
    //            alertHtml += $.customAlert(4, data.message) + '</div>';
    //
    //            $submitBox.before(alertHtml);
    //
    //            $submitBtn.removeAttr('disabled');
    //            $submitBtn.html('登录');
    //          }
    //        }).fail(function(data) {
    //          $submitBtn.removeAttr('disabled');
    //          $submitBtn.html('登录');
    //
    //          var alertHtml = '<div class="qn-form-group special offset-label">';
    //
    //          alertHtml += $.customAlert(4, '登录失败，请重试') + '</div>';
    //
    //          $submitBox.before(alertHtml);
    //        });
    //      };
    //
    //  $.formValidate($('#login-form'), rules, messages, submit);
    //},

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
