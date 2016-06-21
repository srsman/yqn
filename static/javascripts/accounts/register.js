/*
 * 注册
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
  var IS_CELLPHONE = /^0?(13[0-9]|15[0-9]|177|18[0-9]|14[57])[0-9]{8}$/;
  //var IS_CELLPHONE = /^\d{11}$/;
  var regUrl = '/account/register';

  /*
   * 初始化
   * @init: 模块初始化
   * @getCaptcha: 获取注册的手机验证码
   * @verifyRegInfo: 验证用户注册信息
   */
  SEMICOLON.initialize = {
    init: function() {
      this.getCaptcha();
      this.validateRegInfo();
      //SEMICOLON.initialize.verifyRegInfo();
    },

    /* 获取注册的手机验证码 */
    getCaptcha: function() {
      $('#get-captcha').click(function() {
        var $el = $(this),
            $username = $('#username'),
            usernameVal = $.trim($username.val()),
            isCellphone = IS_CELLPHONE,
            param = {},
            params = {};

        if($el.hasClass('disabled')) {
          return false;
        }

        if(usernameVal === '' || !isCellphone.test(usernameVal)) {
          $el.html('获取失败，请重试');
        } else {
          param['phoneNum'] = usernameVal;
          params['params'] = param;

          $el.addClass('disabled');

          $.ajax({
            type: 'POST',
            url: '/account/get_captcha',
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json'
          }).done(function(data) {
            var code = data.code,
                result = data.result;

            if(code === 0) {
              $('#event-id').val(result.eventId);

              $el.html('获取验证码（60）');

              // 倒计时一分钟后再次获取
              var inter = 60;

              var tips = setInterval(function() {
                inter = $.formatNumber(inter - 1);

                if(inter > 0) {
                  $el.html('获取验证码（' + inter + '）');
                } else {
                  clearInterval(tips);

                  $el.removeClass('disabled');
                  $el.html('获取验证码');
                }
              }, 1000);
            } else {
              $el.removeClass('disabled');
              $el.html('获取失败，请重试');
            }
          }).fail(function(data) {
            $el.removeClass('disabled');
            $el.html('获取失败，请重试');
          });
        }
      });
    },

    /* 验证用户注册信息 */
    validateRegInfo: function() {
      // 验证手机是否合法
      $.validate.setRule('isUsername', function(value, element) {
        //var isCellphone = /^0?(13[0-9]|15[0-9]|177|18[0-9]|14[57])[0-9]{8}$/;
        var isCellphone = IS_CELLPHONE;
        return isCellphone.test(value);
      }, '手机号码不合法');

      // 验证昵称是否合法
      $.validate.setRule('isNickname', function(value, element) {
        return (value.indexOf('齐牛') === -1 && value.indexOf('一起牛') === -1);
      }, '昵称不合法');

      // 验证密码是否合法
      $.validate.setRule('isPassword', function(value, element) {
        var isPwd = /^\S{6,18}$/;
        return isPwd.test(value);
      }, '密码由6-18位字母、数字和特殊字符组成');

      $('#reg-form').validate({
        rules: {
          username: {
            required: true,
            isUsername: true
          },
          nickname: {
            required: true,
            isNickname: true
          },
          password: {
            required: true,
            isPassword: true
          },
          captcha: {
            required: true
          }
        },
        success: function () {
          var $submitBox = $('#reg-form-submit-box'),
            $submitBtn = $submitBox.find('button[type="submit"]'),
            $form = $('#reg-form'),
            url = regUrl,
            type = $form.attr('method').toUpperCase(),
            formData = $.serializeFormObject('#reg-form'),
            param = {},
            params = {};

          param['certType'] = 0; // 代表手机号注册
          param['certCode'] = formData.username;
          param['captcha'] = formData.captcha;
          param['eventId'] = formData.event_id;
          param['nickname'] = formData.nickname;
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
              $submitBtn.html('注册中…');
            }
          }).done(function(data) {
            $submitBtn.removeAttr('disabled');
            $submitBtn.html('注册');

            var message,
              alertHtml = '<div class="qn-form-group special offset-label">';

            if(data.code === 0) {
              message = '注册成功，立即' +
              '<a href="/denglu">登录</a>';

              alertHtml += $.customAlert(1, message) + '</div>';
            } else {
              message = data.message;

              if(message === '参数错误') {
                message = '验证码错误或已失效';
              } else if(message === '手机号码已注册') {
                message = '手机号码已注册，直接' +
                '<a href="/denglu">登录</a>';
              }

              alertHtml += $.customAlert(4, message) + '</div>';
            }

            $submitBox.before(alertHtml);
          }).fail(function(data) {
            $submitBtn.removeAttr('disabled');
            $submitBtn.html('注册');

            var alertHtml = '<div class="qn-form-group special offset-label">';

            alertHtml += $.customAlert(4, '注册失败，请重试') + '</div>';

            $submitBox.before(alertHtml);
          });
          return false;
        }
      });
    },

    /* 验证用户注册信息 */
    verifyRegInfo: function() {
      // 验证手机是否合法
      $.validator.addMethod('isUsername', function(value, element) {
        var isCellphone = /^0?(13[0-9]|15[0-9]|177|18[0-9]|14[57])[0-9]{8}$/;

        return this.optional(element) || isCellphone.test(value);
      }, '<i class="fa fa-times"></i>手机号码不合法');

      // 验证昵称是否合法
      $.validator.addMethod('isNickname', function(value, element) {
        return this.optional(element) || (value.indexOf('齐牛') === -1 && value.indexOf('一起牛') === -1);
      }, '<i class="fa fa-times"></i>昵称不合法');

      // 验证密码是否合法
      $.validator.addMethod('isPassword', function(value, element) {
        var isPwd = /^[a-zA-Z]\w{5,17}$/;

        return this.optional(element) || isPwd.test(value);
      }, '<i class="fa fa-times"></i>必须以字母开头，且只能包含字符、数字和下划线');

      // 通用的验证规则
      var rules = {
            username: {
              required: true,
              isUsername: true // 关联上面自定义的验证方法
            },
            captcha: 'required',
            nickname: {
              required: true,
              maxlength: 20,
              isNickname: true // 关联上面自定义的验证方法
            },
            password: {
              required: true,
              rangelength: [6, 18],
              isPassword: true // 关联上面自定义的验证方法
            },
            agreement: 'required'
          },
          messages = {
            username: {
              required: '<i class="fa fa-times"></i>手机号码不能为空'
            },
            captcha: '<i class="fa fa-times"></i>验证码不能为空',
            nickname: {
              required: '<i class="fa fa-times"></i>昵称不能为空',
              maxlength: $.validator.format('<i class="fa fa-times"></i>昵称不能超过{0}个字符')
            },
            password: {
              required: '<i class="fa fa-times"></i>密码不能为空',
              rangelength: $.validator.format('<i class="fa fa-times"></i>密码必须在{0}-{1}个字符之间')
            },
            agreement: '<i class="fa fa-times"></i>您尚未接受《一起牛用户协议》'
          },
          submit = function(form) {
            var $submitBox = $('#reg-form-submit-box'),
                $submitBtn = $submitBox.find('button[type="submit"]'),
                $form = $(form),
                url = $form.attr('action'),
                type = $form.attr('method').toUpperCase(),
                formData = $.serializeFormObject(form),
                param = {},
                params = {};

            param['certType'] = 0; // 代表手机号注册
            param['certCode'] = formData.username;
            param['captcha'] = formData.captcha;
            param['eventId'] = formData.event_id;
            param['nickname'] = formData.nickname;
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
                $submitBtn.html('注册中…');
              }
            }).done(function(data) {
              $submitBtn.removeAttr('disabled');
              $submitBtn.html('注册');

              var message,
                  alertHtml = '<div class="qn-form-group special offset-label">';

              if(data.code === 0) {
                message = '注册成功，立即' +
                          '<a href="/denglu">登录</a>';

                alertHtml += $.customAlert(1, message) + '</div>';
              } else {
                message = data.message;

                if(message === '参数错误') {
                  message = '验证码错误或已失效';
                } else if(message === '手机号码已注册') {
                  message = '手机号码已注册，直接' +
                            '<a href="/denglu">登录</a>';
                }

                alertHtml += $.customAlert(4, message) + '</div>';
              }

              $submitBox.before(alertHtml);
            }).fail(function(data) {
              $submitBtn.removeAttr('disabled');
              $submitBtn.html('注册');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              alertHtml += $.customAlert(4, '注册失败，请重试') + '</div>';

              $submitBox.before(alertHtml);
            });
          };

      // 调用公共的验证方法
      $.formValidate($('#reg-form'), rules, messages, submit);
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
