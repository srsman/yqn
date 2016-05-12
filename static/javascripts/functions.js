/*
 * 通用方法
 * @Author: 大发
 */

define([
  'jquery',
  'emoji'
], function ($, emoji) {
  'use strict';

  /* Banner滑块 */
  $.simpleSlider = function (e, options) {
    var settings = $.extend({
      slide: '.qn-slide', //滑块的类
      useArrows: true, //是否启用箭头
      arrows: '.qn-slider-arrows', //箭头的容器类
      prevArrow: '.arrow-prev', //左边的箭头类
      nextArrow: '.arrow-next', //右边的箭头类
      previousText: '往前', //往前箭头文本
      nextText: '往后', //往后箭头文本
      customArrows: '', //自定义箭头代码
      useControls: true, //是否启用控制器
      controlsClass : 'qn-slider-controllers', //控制器的类
      controls: '.qn-slider-controllers a', //单个控制器元素
      controlActiveClass: 'active', //当前控制器
      slideshow: false, //是否自动播放滑块
      slideshowSpeed: 7000, //自动播放的间隔时间
      fadeSpeed: 500, //滑块切换的速度
      tabsAnimation: false //是否为标签页模式
    }, options);

    var $slider = $(e),
      $slide = $slider.find(settings.slide),
      slidesNumber = $slide.length,
      fadeSpeed = settings.fadeSpeed,
      activeSlide = 0,
      $sliderArrows,
      $sliderPrev,
      $sliderNext,
      $sliderControls,
      sliderTimer,
      controlsHtml = '',
      $container = $slider.find('.container'),
      container_width = $container.width();

    $slider.animationRunning = false;

    $.data(e, 'simpleSlider', $slider);

    $slide.eq(0).addClass('active');

    // 如果不是标签页模式，判断第一张图的背景是明是暗
    if(!settings.tabsAnimation) {
      $slider.addClass(getBgColor($slide.eq(0)));
    }

    // 如果滑块中出现了图片层，那表示该页滑块包含图片
    if($slide.hasClass('slide-with-image')) {
      $slider.addClass('has-image');
    }

    //启用箭头
    if(settings.useArrows && slidesNumber > 1) {
      if(settings.customArrows === '') {
        var arrowsHtml = '<div class="qn-slider-arrows">' +
          '<a class="arrow-prev fa fa-chevron-left" href="javascript:"></a>' +
          '<a class="arrow-next fa fa-chevron-right" href="javascript:"></a>' +
          '</div>';

        $slider.append(arrowsHtml);
      } else {
        $slider.append(settings.customArrows);
      }

      $sliderArrows = $(settings.arrows);
      $sliderPrev = $slider.find(settings.prevArrow);
      $sliderNext = $slider.find(settings.nextArrow);

      $sliderNext.click(function() {
        if($slider.animationRunning) {
          return false;
        }

        $slider.sliderMoveTo('next');

        return false;
      });

      $sliderPrev.click(function() {
        if ($slider.animationRunning) {
          return false;
        }

        $slider.sliderMoveTo('previous');

        return false;
      });
    }

    //启用控制器
    if(settings.useControls && slidesNumber > 1) {
      for(var i = 1; i <= slidesNumber; i++) {
        controlsHtml += '<a href="javascript:"' + ( i === 1 ? ' class="' + settings.controlActiveClass + '"' : '' ) + '>' + i + '</a>';
      }

      controlsHtml = '<div class="' + settings.controlsClass + '">' +
              controlsHtml +
              '</div>';

      $slider.append(controlsHtml);

      $sliderControls = $slider.find(settings.controls);

      $sliderControls.click(function() {
        if($slider.animationRunning) {
          return false;
        }

        $slider.sliderMoveTo($(this).index());

        return false;
      });
    }

    //是否自动播放
    if(settings.slideshow && slidesNumber > 1) {
      $slider.hover(function() {
        $slider.addClass('hovered');

        if(typeof(sliderTimer) !== 'undefined') {
          clearInterval(sliderTimer);
        }
      }, function() {
        $slider.removeClass('hovered');

        sliderAutoRotate();
      });
    }

    // 滑块自动滚动方法
    function sliderAutoRotate() {
      if(settings.slideshow && slidesNumber > 1) {
        if(!$slider.hasClass('hovered')) {
          sliderTimer = setTimeout(function () {
            $slider.sliderMoveTo('next');
          }, settings.slideshowSpeed);
        }
      }
    }
    sliderAutoRotate();

    // 获取滑块背景色
    function getBgColor($slide) {
      if($slide.hasClass('bg-dark')) {
        return 'bg-dark';
      }

      return '';
    }

    $slider.sliderMoveTo = function(direction) {
      var $activeSlide = $slide.eq(activeSlide),
          $nextSlide;

      $slider.animationRunning = true;

      if(direction === 'next' || direction === 'previous') {
        if(direction === 'next') {
          activeSlide = (activeSlide + 1) < slidesNumber ? activeSlide + 1 : 0;
        } else {
          activeSlide = (activeSlide - 1) >= 0 ? activeSlide - 1 : slidesNumber - 1;
        }
      } else {
        if(activeSlide === direction) {
          $slider.animationRunning = false;

          return;
        }

        activeSlide = direction;
      }

      if(typeof(sliderTimer) !== 'undefined') {
        clearInterval(sliderTimer);
      }

      $nextSlide = $slide.eq(activeSlide);

      $slide.each(function() {
        $(this).css('z-index', 1);
      });

      $activeSlide.css('z-index', 2).removeClass('active');

      $nextSlide.css({'display': 'block', 'opacity': 0}).addClass('active');

      if(settings.useControls) {
        $sliderControls.removeClass(settings.controlActiveClass).eq(activeSlide).addClass(settings.controlActiveClass);
      }

      if(!settings.tabsAnimation) {
        $nextSlide.delay(400).animate({'opacity': 1}, fadeSpeed);

        $activeSlide.css({'display': 'block', 'opacity': 1}).delay(400).animate({'opacity': 0}, fadeSpeed, function() {
          var activeSlideBgColor = getBgColor($activeSlide),
              nextSlideBgColor = getBgColor($nextSlide);

          $(this).css('display', 'none');
          $slider.removeClass(activeSlideBgColor).addClass(nextSlideBgColor);
          $slider.animationRunning = false;
        });
      } else {
        $nextSlide.css({'display': 'none', 'opacity': 0});

        $activeSlide.css({'display': 'block', 'opacity': 1}).animate({'opacity': 0}, fadeSpeed, function () {
          $(this).css('display', 'none');

          $nextSlide.css({'display': 'block', 'opacity': 0}).animate({'opacity': 1}, fadeSpeed, function () {
            $slider.animationRunning = false;
          });
        });
      }

      sliderAutoRotate();
    };
  };

  $.fn.simpleSlider = function(options) {
    return this.each(function() {
      new $.simpleSlider(this, options);
    });
  };

  /* 点击效果 */
  $.clickEffects = {
    // 水波纹效果
    ripple: function (e, el) {
      var $el = $(el);

      $el.removeClass('ripple-wrapper');
      $('.ripple').remove();

      var posX = $el.offset().left,
        posY = $el.offset().top,
        buttonWidth = $el.width(),
        buttonHeight = $el.height();

      $el.addClass('ripple-wrapper');
      $el.prepend('<span class="ripple"></span>');

      if (buttonWidth >= buttonHeight) {
        buttonHeight = buttonWidth;
      } else {
        buttonWidth = buttonHeight;
      }

      var x = e.pageX - posX - buttonWidth / 2,
        y = e.pageY - posY - buttonHeight / 2;

      $('.ripple').css({
        width: buttonWidth,
        height: buttonHeight,
        top: y + 'px',
        left: x + 'px'
      }).addClass('ripple-effect');
    }
  };

  $.fn.clickEffects = function(opts) {
    var defaults = {
        ripple: false
      },
      options = $.extend(defaults, opts),
      $el = $(this),
      selector = this.selector || '',
      rippleEffect = function (e) {
        $.clickEffects.ripple(e, this);
      };

    if(options.ripple) {
      if(!selector) {
        $el.unbind('click.ce-start').bind('click.ce-start', rippleEffect);
      } else {
        $(document).undelegate(selector, 'click.ce-start').delegate(selector, 'click.ce-start', rippleEffect);
      }
    }
  };

  /* 表单控件获得焦点时的效果 */
  $.controlFocusEffects = {
    // 获得焦点
    focus: function (el) {
      var $el = $(el);

      $el.closest('.qn-form-group').addClass('focus');
    },

    // 失去焦点
    blur: function (el) {
      var $el = $(el),
        thisVal = $.trim($el.val()),
        $thisParent = $el.closest('.qn-form-group');

      $thisParent.removeClass('focus');

      if (thisVal === '') {
        $thisParent.removeClass('active');
      } else {
        $thisParent.addClass('active');
      }
    }
  };

  $.fn.controlFocusEffects = function () {
    var $el = $(this),
      selector = this.selector || '',
      focus = function () {
        $.controlFocusEffects.focus(this);
      },
      blur = function () {
        $.controlFocusEffects.blur(this);
      };

    if (!selector) {
      $el.unbind('focus.cfe-focus').bind('focus.cfe-focus', focus);
      $el.unbind('blur.cfe-blur').bind('blur.cfe-blur', blur);
    } else {
      $(document).undelegate(selector, 'focus.cfe-focus').delegate(selector, 'focus.cfe-focus', focus);
      $(document).undelegate(selector, 'blur.cfe-blur').delegate(selector, 'blur.cfe-blur', blur);
    }
  };

  /* 当表单元素内有值时，改变该元素父级状态 */
  $.fn.controlStatus = function () {
    this.each(function () {
      var $el = $(this),
        thisControl = $el.find('.qn-form-control');

      if (thisControl.length) {
        var val = $.trim(thisControl.val());

        if (val !== '') {
          $el.addClass('active');
        } else {
          $el.removeClass('active');
        }

        if (thisControl.is('select') && ($el.hasClass('vertical') || $el.hasClass('inline'))) {
          $el.addClass('has-select');
        }
      }
    });
  };

  /*
   * 公用tab
   * @index: 默认第几个tab，不传默认为第一个
   */
  $.fn.qnTab = function (index) {
    this.each(function () {
      var animating = false,
        $el = $(this),
        $cards = $el.children('.qn-tab-card'),
        $card = $cards.children('li'),
        $papers = $el.children('.qn-tab-paper'),
        $paper = $papers.children('.paper-item'),
        activeIndex = $card.filter('.active').index();

      activeIndex = index || (activeIndex === -1 ? 0 : activeIndex) || 0;

      $card.removeClass('active');
      $card.eq(activeIndex).addClass('active');
      $paper.removeClass('active');
      $paper.eq(activeIndex).addClass('active');

      $cards.each(function () {
        var $thisCards = $(this),
          noop = function () {
          },
          $back = $('<li class="back"><div class="left"></div></li>').appendTo($thisCards),
          $li = $('li', this),
          active = $('li.active', this)[0] || $($li[0]).addClass('active')[0];

        $li.not('.back').hover(function () {
          move(this);
        }, noop);

        $(this).hover(noop, function () {
          move(active);
        });

        $li.not('.back').click(function (e) {
          if (!animating) {
            setActive(this);
          }
        });

        setActive(active);

        function setActive(a) {
          $back.css({
            'left': a.offsetLeft + 'px',
            'width': a.offsetWidth + 'px'
          });

          active = a;
        }

        function move(a) {
          $back.each(function () {
            $(this).dequeue();
          }).animate({
              width: a.offsetWidth,
              left: a.offsetLeft
            },
            500, 'easeOutBack');
        }
      });

      $card.on('click', function () {
        slide(this);
      });

      function changeCard(the) {
        var $t = $(the);

        $t.addClass('active').siblings().removeClass('active');
      }

      function changePaper(the) {
        var $t = $(the),
          ai = $t.index();

        $paper.eq(ai).addClass('active').siblings().removeClass('active');

        activeIndex = ai;

        $papers.height($paper.eq(ai).height());
      }

      function slide(the) {
        if (!animating) {
          var $t = $(the),
            ai = $t.index();

          if (ai === activeIndex) {
            return;
          }

          var $fromPaper = $paper.eq(activeIndex),
            $toPaper = $paper.eq(ai),
            $fromPaper_clone = $fromPaper.clone(),
            $toPaper_clone = $toPaper.clone(),
            paperWidth = $papers.width(),
            paperPadding = $papers.css('padding'),
            paperPaddingLeft = parseInt($papers.css('padding-left')),
            paperWidthTotal = paperWidth + 2 * paperPaddingLeft,
            paperHeight = Math.max($fromPaper.height(), $toPaper.height());

          changeCard(the);

          $fromPaper_clone.css({
            'float': 'left',
            'display': 'block',
            'background': '#fff',
            'padding': paperPadding,
            'width': paperWidth,
            'height': $fromPaper.height()
          });

          $toPaper_clone.css({
            'float': 'left',
            'display': 'block',
            'background': '#fff',
            'padding': paperPadding,
            'width': paperWidth,
            'height': $toPaper.height()
          });

          var $animateArea = $('<div></div>');

          $animateArea.css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': 2 * paperWidthTotal,
            'height': paperHeight
          });

          var animateLeft;

          if (ai > activeIndex) {
            $animateArea.css('left', 0).append($fromPaper_clone).append($toPaper_clone);

            animateLeft = -paperWidthTotal;
          } else if (ai < activeIndex) {
            $animateArea.css('left', -paperWidthTotal).append($toPaper_clone).append($fromPaper_clone);

            animateLeft = 0;
          }

          $papers.append($animateArea);

          $papers.height(paperHeight);
          $paper.css({
            'opacity': 0,
            'filter': 'alpha(opacity=0)'
          });

          animating = true;

          $animateArea.animate({
            left: animateLeft
          }, 500, 'easeOutQuint', function () {
            $animateArea.remove();

            changePaper(the);

            $paper.css({
              'opacity': 1,
              'filter': 'alpha(opacity=100)'
            });

            animating = false;
          });
        }
      }
    });
  };

  /**
   * 过滤script标签
   */
  String.prototype.strFilter = function () {

    return this.replace(/<script>/gi, "&lt;script&gt;").replace(/<\/script>/gi, "&lt;/script&gt;");
  };

  String.prototype.stringFilter = function () {
    return this.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  /**
   * 截断字符串
   * 没有考虑emoji的截断问题
   */
  String.prototype.niuStrSub = function (len) {
    // 先将&nbsp;转为" "再截断，再转回来
    var tmp = '';
    tmp = this.replace(/&nbsp;/g," ");
    if(tmp.length > len){
      return tmp.substr(0,len).replace(/ /g,"&nbsp;") + "...";
    }else{
      return tmp.replace(/ /g,"&nbsp;");
    }
  };

  /*
   * 扩展的公共方法
   * @formatNumber: 格式化数字，当数字不足10时，在数字前补0
   * @onlyNum: 生成唯一数
   * @limitText: 截取纯文本的固定字数
   * @formatDate: 格式化时间
   * @timeDifference: 计算时间差
   * @formatPrice: 格式化价格
   * @formatPrecent: 格式化百分号
   * @formValidate: 验证表单
   * @customAlert: 自定义提示信息
   * @serializeFormObject: 序列话表单对象
   * @checkUserIcon: 用户头像处理，防止部分用户头像为空的情况
   * @toEmoji: Emoji转换
   * @filterAngularBracket: 过滤尖括号
   * @filterScriptLabel: 过滤script标签
   * @niuAjax: 通用ajax处理方法
   * @pageNav: 通用分页层
   */
  $.extend({
    /*
     * 说明: 格式化数字，当数字不足10时，在数字前补0
     * @num: Int类型数字
     * 注意事项: 需传入Int类型参数
     * 使用方法: $.formatNumber(num)
     */
    formatNumber: function (num) {
      num = Number(num);

      if (num < 10) {
        num = '0' + num;
      }

      return num;
    },

    /*
     * 说明: 生成唯一数
     * 规则: 当前时间的时间戳 + 6个整数十内的随机数
     * 使用方法: $.onlyNum()
     */
    onlyNum: function () {
      var num = '',
        timestamp = '',
        randomNum = '';

      // 获取当前时间的时间戳
      timestamp = (new Date()).valueOf();

      // 随机数
      for (var r = 0; r < 6; r++) {
        randomNum += Math.floor(Math.random() * 10);
      }

      num = timestamp + randomNum;

      return num;
    },

    /*
     * 说明: 截取纯文本的固定字数
     * @text: 需要截取的纯文本
     * @num: 需要截取的长度，默认50
     * 使用方法: $.limitText(text, num)
     */
    limitText: function (text, num) {
      var newText;

      if (num === undefined) {
        num = 50;
      }

      if (text.length > num) {
        newText = text.substring(0, num) + '…';
      } else {
        newText = text;
      }

      return newText;
    },

    /*
     * 说明: 格式化时间
     * 返回格式: 年.月.日
     * @timestamps: 时间戳
     * @format: 格式
     * 使用方法: $.formatDate(timestamps, 'yyyy-MM-dd hh:mm:ss.S'), 可按需求配置显示部分，例如只显示月、日：$.formatDate(timestamps, 'MM-dd')
     */
    formatDate: function (timestamps, format) {
      var date = new Date(timestamps),
        obj = {
          'M+': date.getMonth() + 1, //月份
          'd+': date.getDate(), //日
          'h+': date.getHours(), //小时
          'm+': date.getMinutes(), //分
          's+': date.getSeconds(), //秒
          'q+': Math.floor((date.getMonth() + 3) / 3), //季度
          'S': date.getMilliseconds() //毫秒
        };

      if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
      }

      for (var k in obj) {
        if (new RegExp('(' + k + ')').test(format)) {
          format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (obj[k]) : (('00' + obj[k]).substr(('' + obj[k]).length)));
        }
      }

      return format;
    },

    /*
     * 说明: 计算时间差
     * 规则: 1.小于1分钟显示 “刚刚”
     *      2.小于1小时显示 “X分钟前”
     *      3.小于24小时且大于1小时显示 “今天 时:分”
     *      4.小于48小时且大于24小时显示 “昨天 时:分”
     *      5.其他但是在今年内显示 “月.日 时:分”
     *      6.其他年份显示 “年.月.日 时:分”
     * @timestamps: 时间戳
     * 使用方法: $.timeDifference(timestamps)
     */
    timeDifference: function (timestamps) {
      var originalTime = new Date(timestamps),
        currentTime = (new Date()).getTime(),
        interval = currentTime - timestamps,
        days,
        hours,
        minutes,
        seconds,
        timeHtml = '';

      days = Math.floor(interval / (24 * 3600 * 1000)); //相差天数
      hours = Math.floor(interval / (3600 * 1000)); //相差小时数
      minutes = Math.floor(interval / (60 * 1000)); //相差分钟
      seconds = Math.floor(interval / 1000); //相差秒数

      var adjustedYear = originalTime.getFullYear(),
        adjustedMonth = $.formatNumber(originalTime.getMonth() + 1),
        adjustedDate = $.formatNumber(originalTime.getDate()),
        adjustedHours = $.formatNumber(originalTime.getHours()),
        adjustedMinutes = $.formatNumber(originalTime.getMinutes()),
        adjustedSeconds = $.formatNumber(originalTime.getSeconds());

      var nowTime = new Date();

      if (originalTime.getFullYear() === nowTime.getFullYear() && originalTime.getMonth() === nowTime.getMonth() && originalTime.getDate() === nowTime.getDate()) {
        if (seconds < 60) {
          timeHtml = '刚刚';
        } else if (minutes < 60) {
          timeHtml = minutes + '分钟前';
        } else {
          timeHtml = '今天&nbsp;' +
          adjustedHours + ':' +
          adjustedMinutes;
        }
      } else if (originalTime.getFullYear() === nowTime.getFullYear() && originalTime.getMonth() === nowTime.getMonth() && originalTime.getDate() === (nowTime.getDate() - 1)) {
        timeHtml = '昨天&nbsp;' +
        adjustedHours + ':' +
        adjustedMinutes;
      } else {
        var yearHtml = '';

        if (adjustedYear !== (new Date()).getFullYear()) {
          yearHtml = adjustedYear + '年';
        }

        timeHtml += yearHtml +
        adjustedMonth + '月' +
        adjustedDate + '日&nbsp;' +
        adjustedHours + ':' +
        adjustedMinutes;
      }

      return timeHtml;
    },

    /*
     * 说明: 格式化价格
     * 返回格式：200,990,345.20
     * @money: 金额
     * @digit: 小数位数，不传默认2
     * 使用方法: $.limitText(text, num)
     */
    formatPrice: function (money, digit) {
      if (null === money) {
        return '';
      }

      if (typeof digit === 'undefined') {
        digit = 2;
      }

      money = money + '';

      var array = money.split('.'),
        s = array[0],
        r = '',
        m = s.substring(0, 1);

      if ('-' === m) {
        s = s.substring(1);
      } else {
        m = '';
      }

      var f = s.split('').reverse();

      for (var i = 0; i < f.length; i++) {
        r += f[i] + ((i + 1) % 3 === 0 && (i + 1) !== f.length ? ',' : '');
      }

      var after = '';

      if (array.length > 1) {
        after = array[1];

        if (after.length > digit) {
          after = after.substring(0, digit);
        }
      }

      return m + r.split('').reverse().join('') + (array.length > 1 ? '.' + after : '');
    },

    /*
     * 说明: 格式化百分号
     * 返回格式：89.66%，+88.21%
     * @num: 数据
     * @digit: 百分比小数位数，默认2位小数
     * @sign: 是否有正号，传值：true || false, 默认有正号
     * 使用方法: $.formatPrecent(0.4343, 2, false)
     */
    formatPrecent: function (num, digit, sign) {
      if (typeof num === 'undefined') {
        return '';
      }

      if (typeof digit === 'undefined' || typeof digit !== 'number') {
        digit = 2;
      }

      if (typeof sign === 'undefined') {
        sign = true;
      }

      var dmr = Math.round(num * Math.pow(10, digit + 2)),
        mle = Math.pow(10, digit);

      if (!sign) {
        return (dmr / mle).toFixed(digit) + '%';
      } else {
        return (num > 0 ? '+' : '') + (dmr / mle).toFixed(digit) + '%';
      }
    },

    /*
     * 验证表单
     * 验证规则的属性配置对应的是input的name属性
     * @$el: form对象
     * @rules: 验证规则
     * @messages: 提示信息
     * @submit: 提交方法（可不传）
     * 使用方法: $.formValidate()
     */
    formValidate: function (el, rules, messages, submit) {
      if (!submit) {
        el.validate({
          errorElement: 'span',
          errorPlacement: function (error, element) {
            error.addClass('qn-form-group-tip');
            element.closest('.qn-form-group').append(error);
          },
          rules: rules,
          messages: messages
        });
      } else {
        el.validate({
          errorElement: 'span',
          errorPlacement: function (error, element) {
            error.addClass('qn-form-group-tip');
            element.closest('.qn-form-group').append(error);
          },
          rules: rules,
          messages: messages,
          submitHandler: submit
        });
      }
    },

    /*
     * 自定义提示信息
     * @type: 提示的类型
     *        1.成功
     *        2.普通信息
     *        3.警告
     *        4.危险
     * @message: 提示的内容，只允许两种数据类型
     *        1.String类型
     *        2.数组
     * 使用方法: $.customAlert(type, message)
     */
    customAlert: function (type, message) {
      var typeIcon,
        alertHtml = '';

      switch (type) {
        case 1:
          alertHtml = '<div class="qn-alert success">';
          typeIcon = '<i class="fa fa-check"></i>';
          break;
        case 2:
          alertHtml = '<div class="qn-alert info">';
          typeIcon = '<i class="fa fa-info"></i>';
          break;
        case 3:
          alertHtml = '<div class="qn-alert warning">';
          typeIcon = '<i class="fa fa-warning"></i>';
          break;
        case 4:
          alertHtml = '<div class="qn-alert danger">';
          typeIcon = '<i class="fa fa-times"></i>';
          break;
      }

      if (typeof(message) === 'object') {
        alertHtml += '<ul>';

        $.each(message, function (i, value) {
          alertHtml += '<li>' + typeIcon + value + '</li>';
        });

        alertHtml += '</ul>';
      } else {
        alertHtml += typeIcon + message;
      }

      alertHtml += '</div>';

      return alertHtml;
    },

    /*
     * 序列化表单对象
     * 将普通表单的值转换成json对象
     * @form: 表单对象
     * 使用方法: $.serializeFormObject(form)
     */
    serializeFormObject: function (form) {
      var adjustedObj = {},
        formObj = $(form).serializeArray();

      $.each(formObj, function () {
        if (adjustedObj[this.name] !== undefined) {
          if (!adjustedObj[this.name].push) {
            adjustedObj[this.name] = [adjustedObj[this.name]];
          }

          adjustedObj[this.name].push(this.value || '');
        } else {
          adjustedObj[this.name] = this.value || '';
        }
      });

      return adjustedObj;
    },

    /*
     * 用户头像处理，防止部分用户头像为空的情况
     * 如果没有头像，显示默认头像
     * @icon: 用户头像地址
     * @gender: 用户性别，不传默认男性
     * 使用方法: $.checkUserIcon(icon, gender)
     */
    checkUserIcon: function (icon, gender) {
      if (icon) {
        return icon;
      } else {
        if (gender && parseInt(gender) === 0) {
          return '/images/default_avatar_woman.jpg';
        } else {
          return '/images/default_avatar_man.jpg';
        }
      }
    },

    /*
     * Emoji转换
     * @html : 要替换的html
     * 使用方式: $.toEmoji(html)
     */
    toEmoji: function (html) {
      emoji.init_env();
      emoji.replace_mode = 'img';
      emoji.supports_css = false;
      emoji.include_title = false;
      emoji.img_set = 'google';
      emoji.img_sets['google']['path'] = '/images/emoji-apple/';

      return emoji.replace_colons(html);
    },

    /*
     * 过滤尖括号，转译文本中的尖括号
     * @val: 需要过滤的文本
     * 使用方式: $.filterAngularBracket(val)
     */
    filterAngularBracket: function (val) {
      val = val.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return val;
    },

    /*
     * 过滤script标签
     * @val: 需要过滤的文本
     * 使用方式: $.filterScriptLabel(val)
     */
    filterScriptLabel: function (val) {
      val = val.replace(/<script>/g,"&lt;script&gt;").replace(/<\/script>/g,"&lt;/script&gt;");

      return val;
    },

    /*
     * 封装AJAX处理方法，请求方式'POST',请按场景使用
     * @reqUrl: 请求地址, 必填
     * @params: 请求参数，必填
     * @success: 请求成功回调函数，必填
     * @error: 请求失败回调函数
     * 使用方式: $.niuAjax(reqUrl, params, success)
     */
    niuAjax: function (reqUrl, params, success, error) {

      if (typeof success !== 'function') {
        return;
      }

      if (typeof error !== 'undefined' && typeof error !== 'function') {
        error = function () {
          console.log('请求失败');
        };
      }

      $.ajax({
        type: 'POST',
        url: reqUrl,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json',
        success: success,
        error: error
      });
    },

    /*
     * 通用分页层
     * @curPage: 当前页码
     * @totalPage: 总页码
     * @pageNavClass: 分页可点项的class名
     */
    pageNav: function (curPage, totalPage, pageNavClass) {
      var radius = 1;
      var i = 0;
      var $pageNav = $('<div class="qn-page-nav">' +
        '<span class="pages"></span>' +
        '</div>'),
        start = 0,
        end = 0;

      $pageNav.data('total', totalPage);
      $pageNav.find('.pages').html('第' + curPage + '页，共' + totalPage + '页');


      var _html = '';

      /* 当前页为第一页 */
      if (curPage === 1) {

        _html += '<span class="current">1</span>';

        start = curPage + 1;

        end = (curPage + radius * 2) > totalPage ? totalPage : (curPage + 2);

        for (i = start; i <= end; i++) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + i + '" href="javascript:">' + i + '</a>';
        }

        if (totalPage - end > 1) {
          _html += '<span class="extend">...</span>';
        }

        if (totalPage - end > 0) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + totalPage + '" href="javascript:">' + totalPage + '</a>';
        }
      /* 当前页为最后一页 */
      } else if (curPage === totalPage) {
        /* 当前页为最后一页 */
        start = (curPage - radius * 2) < 1 ? 1 : (curPage - radius * 2);

        end = totalPage - 1;

        if (start - 1 > 0) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + 1 + '" href="javascript:">1</a>';
        }

        if (start - 1 > 1) {
          _html += '<span class="extend">...</span>';
        }

        for (i = start; i <= end; i++) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + i + '" href="javascript:">' + i + '</a>';
        }

        _html += '<span class="current">' + totalPage + '</span>';
      } else {
        /* 计算要显示的窗口 */
        start = curPage - radius;

        end = curPage + radius;

        if (start > 1) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + 1 + '" href="javascript:">1</a>';
        }

        if (start > 2) {
          _html += '<span class="extend">...</span>';
        }

        for (i = start; i < curPage; i++) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + i + '" href="javascript:">' + i + '</a>';
        }

        _html += '<span class="current">' + curPage + '</span>';

        for (i = curPage + 1; i <= end; i++) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + i + '" href="javascript:">' + i + '</a>';
        }

        if (totalPage - end >= 2) {
          _html += '<span class="extend">...</span>';
        }

        if (totalPage - end >= 1) {
          _html += '<a class="page ' + pageNavClass + '" data-num="' + totalPage + '" href="javascript:">' + totalPage + '</a>';
        }
      }

      $pageNav.find('.pages').after(_html);

      return $pageNav;
    }
  });
});