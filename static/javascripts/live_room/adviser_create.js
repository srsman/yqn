/*
 * 投顾创建直播群
 * @Author: 大发
 */

require([
  'jquery',
  'common',
  'sui'
], function($) {
  'use strict';

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};
  var createUrl = '/live_room/create';
  /*
   * 初始化
   * @init: 模块初始化
   * @chooseVerifyMode: 切换验证模式
   * @chooseChargeMode: 切换收费模式
   * @verifyCreateInfo: 验证创建信息
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.chooseVerifyMode();
      SEMICOLON.initialize.chooseChargeMode();
      SEMICOLON.initialize.validateCreateInfo();

    },

    /* 验证创建信息 */
    validateCreateInfo: function() {
      // 数字，不判断空字符
      //$.validate.setRule('number', function(value, element, params) {
      //  if (value === '' || typeof value === 'undefined') {
      //    return true;
      //  }
      //  return /^[0-9]+$/.test(value);
      //},'请输入整数');
      // 保留小数多少位
      //$.validate.setRule('decimal', function(value, element, params) {
      //  var decimal = value.split('.')[1];
      //  if (decimal && decimal.length > 2) {
      //    return false;
      //  }
      //  return true;
      //},'小数位数不能超过两位');

      // 验证是否大于等于
      $.validate.setRule('ge', function(value, element, params) {
        var pass = true;
        if (parseFloat(value) < parseFloat(params)) {
          pass = false;
        }
        return pass;
      },'金额不能小于$0');
      // 验证是否小于等于
      $.validate.setRule('le', function(value, element, params) {
        var pass = true;
        if (parseFloat(value) > parseFloat(params)) {
          pass = false;
        }
        return pass;
      },'金额不能大于$0');
      // 验证是否设置价格
      $.validate.setRule('isPrice', function(value, element) {
        var chargeMode = $('input:radio[name="is_charge"]:checked').val(),
          priceVal = $.trim(value),
          pass = true;
        if(chargeMode === 'Y' && priceVal === '') {
          pass = false;
        }
        return pass;
      },'请填写直播群价格');
      // 比较价格与优惠价格
      $.validate.setRule('relativePrice', function(value, element) {
        var priceVal = parseInt($.trim($('#price').val())),
          pass = true;
        value = parseInt(value);
        if(value >= priceVal) {
          pass = false;
        }
        return pass;
      }, '该价格必须小于原价');

      // 验证
      $('#create-form').validate({
        rules: {
          group_name: {
            required: true,
            minlength: 1,
            maxlength: 10
          },
          description: {
            maxlength: 50
          },
          price: {
            required: true,
            digits: true,
            le: 3000,
            ge: 1,
            isPrice: true
          },
          sales_price: {
            digits: true,
            le: 3000,
            ge: 1,
            relativePrice: true
          },
          vip_sales_price: {
            digits: true,
            le: 3000,
            ge: 1,
            relativePrice: true
          }
        },
        success: function () {
          var $submitBox = $('#create-form-submit-box'),
            $submitBtn = $submitBox.find('button[type="submit"]'),
            $form = $('#create-form'),
            url = createUrl,
            type = $form.attr('method').toUpperCase(),
            formData = $.serializeFormObject('#create-form'),
            params = {},
            param = {};

          param['groupName'] = formData.group_name; // 直播群名称
          param['description'] = formData.description; // 直播群描述
          param['needVerify'] = formData.need_verify_val; // 是否需要验证
          param['isCharge'] = formData.is_charge_val; // 是否收费

          if(formData.is_charge === 'Y') {
            param['price'] = formData.price; // 每月价格
            param['salesPrice'] = formData.sales_price; // 优惠价
            param['vipPrice'] = formData.vip_sales_price; // VIP优惠价
          }

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
              $submitBtn.html('创建中…');
            }
          }).done(function(data) {
            $submitBtn.removeAttr('disabled');
            $submitBtn.html('完成');

            var alertHtml = '<div class="qn-form-group special offset-label">';

            if(data.code === 0) {
              var alertText = '创建成功，<a href="/live_room/list">返回直播群列表</a>';

              alertHtml += $.customAlert(1, alertText) + '</div>';

              $submitBox.before(alertHtml);
            } else {
              alertHtml += $.customAlert(4, data.message) + '</div>';

              $submitBox.before(alertHtml);
            }
          }).fail(function(data) {
            $submitBtn.removeAttr('disabled');
            $submitBtn.html('完成');

            var alertHtml = '<div class="qn-form-group special offset-label">';

            alertHtml += $.customAlert(4, '创建失败') + '</div>';

            $submitBox.before(alertHtml);
          });
          return false;
        }
      });
    },

    /* 验证创建信息 */
    verifyCreateInfo: function() {
      // 验证群名称是否为空
      $.validator.addMethod('titleNull', function(value, element) {
        var titleVal = $.trim(value),
            pass = true;

        if(titleVal.length <= 0) {
          pass = false;
        }

        return pass;
      }, '<i class="fa fa-times"></i>直播群名称不能为空');

      // 验证是否设置价格
      $.validator.addMethod('isPrice', function(value, element) {
        var chargeMode = $('input:radio[name="is_charge"]:checked').val(),
            priceVal = $.trim(value),
            pass = true;

        if(chargeMode === 'Y' && priceVal === '') {
          pass = false;
        }

        return pass;
      }, '<i class="fa fa-times"></i>请填写直播群价格');


      // 比较价格与优惠价格
      $.validator.addMethod('relativePrice', function(value, element) {
        var priceVal = parseInt($.trim($('#price').val())),
            pass = true;

        value = parseInt(value);

        if(value >= priceVal) {
          pass = false;
        }

        return pass;
      }, '<i class="fa fa-times"></i>该价格不能大于原价');

      var rules = {
            group_name: {
              required: true,
              minlength: 1,
              maxlength: 10,
              titleNull: true
            },
            description: {
              maxlength: 50
            },
            price: {
              min: 1,
              max: 3000,
              isPrice: true
            },
            sales_price: {
              min: 1,
              max: 3000,
              relativePrice: true
            },
            vip_sales_price: {
              min: 1,
              max: 3000,
              relativePrice: true
            }
          },
          messages = {
            group_name: {
              required: '<i class="fa fa-times"></i>直播群名称不能为空',
              minlength: $.validator.format('<i class="fa fa-times"></i>直播群名称不能超过{0}个字符'),
              maxlength: $.validator.format('<i class="fa fa-times"></i>直播群名称不能超过{0}个字符')
            },
            description: {
              maxlength: $.validator.format('<i class="fa fa-times"></i>直播群描述不能超过{0}个字符')
            },
            price: {
              min: $.validator.format('<i class="fa fa-times"></i>金额不能少于{0}元'),
              max: $.validator.format('<i class="fa fa-times"></i>金额不能大于{0}元')
            },
            sales_price: {
              min: $.validator.format('<i class="fa fa-times"></i>金额不能少于{0}元'),
              max: $.validator.format('<i class="fa fa-times"></i>金额不能大于{0}元')
            },
            vip_sales_price: {
              min: $.validator.format('<i class="fa fa-times"></i>金额不能少于{0}元'),
              max: $.validator.format('<i class="fa fa-times"></i>金额不能大于{0}元')
            }
          },
          submit = function(form) {
            var $submitBox = $('#create-form-submit-box'),
                $submitBtn = $submitBox.find('button[type="submit"]'),
                $form = $(form),
                url = $form.attr('action'),
                type = $form.attr('method').toUpperCase(),
                formData = $.serializeFormObject(form),
                params = {},
                param = {};

            param['groupName'] = formData.group_name; // 直播群名称
            param['description'] = formData.description; // 直播群描述
            param['needVerify'] = formData.need_verify_val; // 是否需要验证
            param['isCharge'] = formData.is_charge_val; // 是否收费

            if(formData.is_charge === 'Y') {
              param['price'] = formData.price; // 每月价格
              param['salesPrice'] = formData.sales_price; // 优惠价
              param['vipPrice'] = formData.vip_sales_price; // VIP优惠价
            }

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
                $submitBtn.html('创建中…');
              }
            }).done(function(data) {
              $submitBtn.removeAttr('disabled');
              $submitBtn.html('完成');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              if(data.code === 0) {
                var alertText = '创建成功，<a href="/live_room/list">返回直播群列表</a>';

                alertHtml += $.customAlert(1, alertText) + '</div>';

                $submitBox.before(alertHtml);
              } else {
                alertHtml += $.customAlert(4, data.message) + '</div>';

                $submitBox.before(alertHtml);
              }
            }).fail(function(data) {
              $submitBtn.removeAttr('disabled');
              $submitBtn.html('完成');

              var alertHtml = '<div class="qn-form-group special offset-label">';

              alertHtml += $.customAlert(4, '创建失败') + '</div>';

              $submitBox.before(alertHtml);
            });
          };

      $.formValidate($('#create-form'), rules, messages, submit);
    },

    /* 切换验证模式 */
    chooseVerifyMode: function() {
      /* 需验证才可以加入 */
      $('#need-verify-y').on('click', function() {
        // 修改隐藏域的值
        $('#needVerifyVal').val('Y');
      });
      /* 不需验证就可以加入 */
      $('#need-verify-n').on('click', function() {
        // 修改隐藏域的值
        $('#needVerifyVal').val('N');
      });
    },

    /* 切换收费模式 */
    chooseChargeMode: function() {
      /* 切换至免费模式 */
      $('#is-charge-n').on('click', function() {
        // 修改价格的name，实现不验证
        $('#price').attr('name','price2');
        $('#sales-price').attr('name','sales_price2');
        $('#vip-sales-price').attr('name','vip_sales_price2');
        // 修改隐藏域的值
        $('#isChargeVal').val('N');

        $('.setting-create-price-box').slideUp();
        // 需要验证按钮可用
        $('#need-verify-y').parent().show();
      });

      /* 切换至收费模式 */
      $('#is-charge-y').on('click', function() {
        // 当选择收费模式时，该群必须是所有人可以加入的
        //$('#need-verify-n').iCheck('check');
        // 修改价格的name，验证
        $('#price').attr('name','price');
        $('#sales-price').attr('name','sales_price');
        $('#vip-sales-price').attr('name','vip_sales_price');
        // 修改隐藏域的值
        $('#isChargeVal').val('Y');

        $('.setting-create-price-box').slideDown();

        // 将验证方式改为不需要验证
        $('#need-verify-n').trigger('click');
        // 需要验证按钮不可用
        $('#need-verify-y').parent().hide();
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