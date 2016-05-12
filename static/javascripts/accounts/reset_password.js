/*
 * 找回密码
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
   * @getCaptcha: 获取注册的手机验证码
   * @verifyPhone: 验证账号
   * @resetPassword: 重置密码
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.getCaptcha();
      SEMICOLON.initialize.verifyPhone();
    },

    /* 获取注册的手机验证码 */
    getCaptcha: function() {
      $('#get-captcha').click(function() {
        var $el = $(this),
            $username = $('#username'),
            usernameVal = $.trim($username.val()),
            isCellphone = /^0?(13[0-9]|15[0-9]|177|18[0-9]|14[57])[0-9]{8}$/,
            params = {},
            param = {};

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

    /* 验证账号 */
    verifyPhone: function() {
      // 验证手机是否合法
      $.validator.addMethod('isUsername', function(value, element) {
        var isCellphone = /^0?(13[0-9]|15[0-9]|177|18[0-9]|14[57])[0-9]{8}$/;

        return this.optional(element) || isCellphone.test(value);
      }, '<i class="fa fa-times"></i>手机号码不合法');

      var rules = {
            username: {
              required: true,
              isUsername: true // 关联上面自定义的验证方法
            },
            captcha: 'required'
          },
          messages = {
            username: {
              required: '<i class="fa fa-times"></i>手机号码不能为空'
            },
            captcha: '<i class="fa fa-times"></i>验证码不能为空'
          },
          submit = function(form) {
            var $submitBox = $('#valid-form-submit-box'),
                $submitBtn = $submitBox.find('button[type="submit"]'),
                $form = $(form),
                url = $form.attr('action'),
                type = $form.attr('method').toUpperCase(),
                formData = $.serializeFormObject(form),
                params = {},
                param = {};

            var username = formData.username,
                captcha = formData.captcha,
                eventId = formData.event_id;

            param['phoneNum'] = username;
            param['captcha'] = captcha;
            param['evenId'] = parseInt(eventId);

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
              }
            }).done(function(data) {
              $submitBtn.removeAttr('disabled');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              if(data.code === 0) {
                if(data.result.isReg === 'Y') {
                  var newFormHtml = '<form id="reset-form" action="/account/reset_password" method="post">' +
                      '<div class="qn-form-group">' +
                      '<label class="qn-control-label" for="new-password">新密码</label>' +
                      '<div class="qn-form-control-box">' +
                      '<input type="password" id="new-password" class="qn-form-control" name="new_password" placeholder="请填写新密码" tabindex="1">' +
                      '</div>' +
                      '</div>' +
                      '<div class="qn-form-group">' +
                      '<label class="qn-control-label" for="repeat-password">重复密码</label>' +
                      '<div class="qn-form-control-box">' +
                      '<input type="password" id="repeat-password" class="qn-form-control" name="repeat_password" placeholder="请重复输入密码" tabindex="2">' +
                      '<input type="hidden" name="username" value="' + username + '">' +
                      '<input type="hidden" name="captcha" value="' + captcha + '">' +
                      '<input type="hidden" name="event_id" value="' + eventId + '">' +
                      '</div>' +
                      '</div>' +
                      '<div class="qn-form-group offset-label" id="reset-form-submit-box">' +
                      '<button type="submit" class="qn-btn primary">确认</button>' +
                      '</div>' +
                      '</form>';

                  $form.after(newFormHtml);
                  $form.remove();

                  SEMICOLON.initialize.resetPassword();
                } else {
                  alertHtml += $.customAlert(4, '验证失败，请重试') + '</div>';

                  $submitBox.before(alertHtml);
                }
              } else {
                alertHtml += $.customAlert(4, data.message) + '</div>';

                $submitBox.before(alertHtml);
              }
            }).fail(function(data) {
              $submitBtn.removeAttr('disabled');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              alertHtml += $.customAlert(4, data.message) + '</div>';

              $submitBox.before(alertHtml);
            });
          };

      $.formValidate($('#verify-form'), rules, messages, submit);
    },

    /* 重置密码 */
    resetPassword: function() {
      // 验证密码是否合法
      $.validator.addMethod('isPassword', function(value, element) {
        var isPwd = /^[a-zA-Z]\w{5,17}$/;

        return this.optional(element) || isPwd.test(value);
      }, '<i class="fa fa-times"></i>必须以字母开头，且只能包含字符、数字和下划线');

      var rules = {
            new_password: {
              required: true,
              rangelength: [6, 18],
              isPassword: true // 关联上面自定义的验证方法
            },
            repeat_password: {
              equalTo: '#new-password'
            }
          },
          messages = {
            new_password: {
              required: '<i class="fa fa-times"></i>密码不能为空',
              rangelength: '<i class="fa fa-times"></i>密码必须在6-18个字符之间'
            },
            repeat_password: {
              equalTo: '<i class="fa fa-times"></i>两次密码不一致'
            }
          },
          submit = function(form) {
            var $submitBox = $('#reset-form-submit-box'),
                $submitBtn = $submitBox.find('button[type="submit"]'),
                $form = $(form),
                url = $form.attr('action'),
                type = $form.attr('method').toUpperCase(),
                formData = $.serializeFormObject(form),
                params = {},
                param = {};

            param['phoneNum'] = formData.username;
            param['captcha'] = formData.captcha;
            param['eventId'] = formData.event_id;
            param['newPwd'] = formData.new_password;

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
              }
            }).done(function(data) {
              $submitBtn.removeAttr('disabled');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              if(data.code === 0) {
                var message = '修改成功，立即<a href="/denglu">登录</a>';

                alertHtml += $.customAlert(1, message) + '</div>';

                $form.before(alertHtml);
                $form.remove();
              } else {
                alertHtml += $.customAlert(4, data.message) + '</div>';

                $submitBox.before(alertHtml);

                // 清空表单
                $('#reset-form')[0].reset();
              }
            }).fail(function(data) {
              $submitBtn.removeAttr('disabled');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              alertHtml += $.customAlert(4, data.message) + '</div>';

              $submitBox.before(alertHtml);

              // 清空表单
              $('#reset-form')[0].reset();
            });
          };

      $.formValidate($('#reset-form'), rules, messages, submit);
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
