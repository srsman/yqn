/*
 * 初始化方法
 * @Author: 大发
 */

define([
  'jquery',
  'template',
  'qrcode',
  'pager',
  'push',
  'dialog'
], function($, template, qrcode) {
  // 'use strict'; // 百度分享不支持

  var $window = $(window);

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 初始化
   * @init: 模块初始化方法
   * @initEmoji: 初始化页面中的emoji（需优化的方法，该功能应在模板绑定时执行，先mark）
   * @initPlugins: 初始化插件
   * @goToTopStatus: 回到顶部按钮的显示与隐藏
   * @goToTop: 回到顶部
   * @sidebarHighlight: 侧边栏菜单高亮
   * @pageShare: 分享页面
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.initEmoji();
      SEMICOLON.initialize.initPlugins();
      SEMICOLON.initialize.goToTopStatus();
      SEMICOLON.initialize.goToTop();
      if($('.main-sidebar').length) {
        SEMICOLON.initialize.sidebarHighlight();
      }
      if($('.invokeDialog').length){
        SEMICOLON.initialize.initInvokeDialog();
      }
      if($('.bdsharebuttonbox').length) {
        SEMICOLON.initialize.pageShare();
      }
    },

    /* 初始化页面中的Emoji */
    initEmoji: function() {
      var initHtml = $('body').html();

      $('body').html($.toEmoji(initHtml));
    },

    /* 初始化插件 */
    initPlugins: function() {
      // 按钮点击效果
      $('.qn-btn').clickEffects({
        ripple: true
      });

      // 表单元素获取焦点样式
      $('.qn-form-control').controlFocusEffects();

      // 表单控件状态
      $('.qn-form-group').controlStatus();

      // 美化单、多选框
      $('input.icheck').iCheck({
        checkboxClass: 'qn-icheckbox',
        radioClass: 'qn-iradio'
      });

      // tab控件
      $('.qn-tab').qnTab();
    },

    /* 回到顶部按钮的显示与隐藏 */
    goToTopStatus: function() {
      if($window.scrollTop() > 450) {
        $('#go-to-top').fadeIn();
      } else {
        $('#go-to-top').fadeOut();
      }
    },

    /* 回到顶部 */
    goToTop: function() {
      $('#go-to-top').click(function() {
        $('body, html').stop(true).animate({scrollTop: 0}, 400);

        return false;
      });
    },

    /* 侧边栏菜单高亮 */
    sidebarHighlight: function() {
      var url = window.location.href,
          regx = /https:\/\/|http:\/\//,
          section = url.replace(regx,"").split("/"),
          keyword;

      if($('.sidebar-menu-wrap').find('.' + section[1]).length > 1) {
        keyword = section[2];
      } else {
        keyword = section[1];
      }

      $('.sidebar-menu-wrap').find('.' + keyword).addClass('active');
    },

    initInvokeDialog:function() {
      var $button = $('.invokeDialog');

      $button.click(function() {
        var $this = $(this),
            adInfo = $this.data('adinfo');

        $('.seo-body').append( template('dialog', adInfo) );

        var $dialog = $('.qn-seo-dialog'),
            $shadow = $('.qn-seo-shadow'),
            $qrcode = $('.dialog-qrcode');

        $qrcode.qrcode({
          width: 166,
          height: 166,
          text: $this.data('qrurl')
        });

        $('#dialog-close').click(function() {
          $dialog.remove();
          $shadow.remove();
        });

      });
    },

    /* 分享页面 */
    pageShare: function() {
      window._bd_share_config = {
        "common": {
          "bdSnsKey": {},
          "bdText": "",
          "bdMini": "2",
          "bdMiniList": false,
          "bdPic": "",
          "bdStyle": "1",
          "bdSize": "16"
        },
        "share": {}
      };

      with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='/javascripts/lib/share/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];
    }
  };

  /*
   * 页眉操作
   * @init: 模块初始化
   * @fixedHeader: 固定页眉
   * @headerAccountStatus: 页眉操作的显示隐藏
   * @headerSearch: 页眉搜索
   */
  SEMICOLON.header = {
    init: function() {
      SEMICOLON.header.fixedHeader();
      SEMICOLON.header.headerAccountStatus();
      SEMICOLON.header.headerSearch();
    },

    // 固定页眉
    fixedHeader: function() {
      if($window.scrollTop() > 0) {
        $('.header').addClass('fixed');
      } else {
        if($('.header').hasClass('fixed')) {
          $('.header').removeClass('fixed');
        }
      }
    },

    /* 页眉操作的显示隐藏 */
    headerAccountStatus: function() {
      // 页眉操作的显示隐藏
      $('#header-user-avatar-box').click(function() {
        var $el = $(this),
            $parent = $el.parent();

        if(!$parent.hasClass('active')) {
          $parent.addClass('active');

          $el.find('.fa-caret-down').addClass('fa-caret-up').removeClass('fa-caret-down');
        } else {
          $parent.removeClass('active');

          $el.find('.fa-caret-up').addClass('fa-caret-down').removeClass('fa-caret-up');
        }
      });

      // 点击任何地方关闭页眉操作层
      $(document).on('click', function(event) {
        if(!$(event.target).closest('.header-account-wrap').length) {
          $('.header-account-wrap').removeClass('active');

          $('.header-user-avatar-box').find('.fa-caret-up').addClass('fa-caret-down').removeClass('fa-caret-up');
        }
      });
    },

    // 页眉搜索
    headerSearch: function() {
      $('#header-search-form').submit(function() {
        return false;
      });

      $('#header-search-input').keyup(function(e) {
        if(e.keyCode !== 13 && e.keyCode !== 38 && e.keyCode !== 40) {
          var $el = $(this),
              searchContent = $.trim($el.val()),
              $resultList = $el.siblings('.header-search-result-list'),
              listItem = '',
              url = '/stock/query',
              param = {},
              params = {};

          if(searchContent !== '') {
            param['condition'] = searchContent;
            param['flag'] = 1 << 0;
            param['pageSize'] = 3;

            params['module'] = 'market';
            params['params'] = param;

            $.ajax({
              type: 'POST',
              url: url,
              data: JSON.stringify(params),
              dataType: 'json',
              contentType: 'application/json'
            }).done(function(data) {
              if(data.code === 0) {
                if(data.result.stks) {
                  var stks = data.result.stks;

                  for(var i = 0; i < stks.length; i++) {
                    var item = stks[i],
                        itemName = item.name + ' ' + item.id;

                    itemName = itemName.replace(searchContent, '<i>' + searchContent + '</i>');

                    if(i === 0) {
                      listItem += '<li class="active" data-url="/gupiao/' + item.id + '">';
                    } else {
                      listItem += '<li data-url="/gupiao/' + item.id + '">';
                    }

                    listItem += '<a href="/gupiao/' + item.id + '">' +
                            itemName +
                            '</a>' +
                            '</li>';
                  }
                } else {
                  listItem += '<li>' +
                          '<a href="javascript:">没有结果</a>' +
                          '</li>';
                }
              } else {
                listItem += '<li>' +
                        '<a href="javascript:">搜索失败</a>' +
                        '</li>';
              }

              $('.header-search-result-list').remove();

              var newResultList = '<ul class="header-search-result-list">';

              newResultList += listItem + '</ul>';

              $el.parent().append(newResultList);
            }).fail(function(data) {
              listItem += '<li>' +
                        '<a href="javascript:">搜索失败</a>' +
                        '</li>';

              if($resultList.length) {
                $resultList.find('li').remove();

                $resultList.append(listItem);
              } else {
                var newResultList = '<ul class="header-search-result-list">';

                newResultList += listItem + '</ul>';

                $el.parent().append(newResultList);
              }
            });
          } else {
            $('.header-search-result-list').remove();
          }
        }
      });

      $(document).keyup(function(e) {
        if($('.header-search-result-list').length) {
          // 上下
          if(e.keyCode === 38) {
            getActiveSearchItem('up');
          } else if(e.keyCode === 40 ) {
            getActiveSearchItem('down');
          }

          // 回车
          if(e.keyCode === 13) {
            var sUrl = $('.header-search-result-list').find('li.active').data('url');

            window.location.href = sUrl;
          }
        }
      });

      function getActiveSearchItem(dir) {
        var sIndex;

        sIndex = $('.header-search-result-list').find('li.active').index();

        if(sIndex === -1) {
          return false;
        }

        if(dir === 'up') {
          sIndex = sIndex - 1 < 0 ? 0 : sIndex - 1;
        } else if(dir === 'down') {
          var maxIndex = $('.header-search-result-list').find('li').length - 1;

          sIndex = sIndex + 1 > maxIndex ? maxIndex : sIndex + 1;
        }

        $('.header-search-result-list').find('li.active').removeClass('active');
        $('.header-search-result-list').find('li').eq(sIndex).addClass('active');
      }
    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化方法
   * @windowScroll: 窗口滚动条滚动时促发
   * @slider: 滑块
   */
  SEMICOLON.documentOnReady = {
    init: function() {
      SEMICOLON.initialize.init();
      SEMICOLON.header.init();
      SEMICOLON.documentOnReady.windowScroll();

      if($('.qn-slider').length) {
        SEMICOLON.documentOnReady.slider();
      }
    },

    windowScroll: function() {
      $window.scroll(function() {
        SEMICOLON.header.fixedHeader();
        SEMICOLON.initialize.goToTopStatus();
      });
    },

    // 滑块
    slider: function() {
      $('.qn-slider').each(function () {
        var $thisSlider = $(this),
          sliderSettings = {
            fade_speed: 700,
            slide: '.qn-slide'
          };

        if($thisSlider.hasClass('no-arrows')) {
          sliderSettings.use_arrows = false;
        }

        if($thisSlider.hasClass('no-pagination')) {
          sliderSettings.use_controls = false;
        }

        if($thisSlider.hasClass('auto')) {
          sliderSettings.slideshow = true;
        }

        $thisSlider.simpleSlider(sliderSettings);
      });
    }
  };

  /*
   * 页面加载完执行
   * @init: 模块初始化
   */
  SEMICOLON.documentOnLoad = {
    init: function() {

    }
  };

  /*
   * 页面改变大小时执行
   * @init: 模块初始化
   */
  SEMICOLON.documentOnResize = {
    init: function() {

    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
  $window.load(SEMICOLON.documentOnLoad.init);
  $window.on('resize', SEMICOLON.documentOnResize.init);
});