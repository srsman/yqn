/*
 * 插入股票插件，如果搜索股票的接口有变动，请配置API。
 * @Author: qinxingjun
 */

define([
  'jquery',
  'tinymce'
], function($) {
  'use strict';

  /* 接口 */
  var API = {
    searchStk : '/viewpoint/search_stk' // 搜索股票
  };

  /*
   * 搜索股票对象
   */
  var StockAutoComplete = {

    autocompte_result_active: !1,

    dialog_active: !1, // 防止多次绑定事件

    // 初始化
    init: function() {
      tinymce.PluginManager.add('niustock', function(editor) {

        var lock = 0;
        // 显示弹窗界面
        function initialize() {
          var dom = editor.dom,
              stockLink,
              text,
              dialog;

          // 找到dom下所有带有href属性的a标签
          stockLink = dom.getParent(editor.selection.getNode(), 'a[href]');

          // 获取当前a标签的文字
          text = stockLink ? (stockLink.innerText || stockLink.textContent) : editor.selection.getContent({format: 'text'});

          // 配置弹窗
          dialog = editor.windowManager.open({
            title: '插入股票',
            width: parseInt(editor.getParam('plugin_preview_width', '450'), 10),
            height: parseInt(editor.getParam('plugin_preview_height', '230'), 10),
            html: StockAutoComplete.searchWidgetHtml(text),
            buttons: {
              text: '关闭',
              onclick: function() {
                this.parent().parent().close();
              }
            }
          });

          if(!StockAutoComplete.dialog_active){
            StockAutoComplete.inputKeyupHandle();
            StockAutoComplete.inputFocusHandle();
            StockAutoComplete.inputBlurHandle();
            StockAutoComplete.stocksMouseenterHandle();
            StockAutoComplete.stocksMouseleaveHandle();
          }

          StockAutoComplete.stocksClickHandle(editor, editor.dom, dialog);

          StockAutoComplete.dialog_active = 1;
        }

        // 在tinymce中增加插件图标
        editor.addButton('niustock', {
          title: '股票',
          icon: 'niustock',
          tooltip: '插入股票',
          onclick: initialize
        });
      });
    },

    // 搜索框html
    searchWidgetHtml: function(t) {
      var searchHtml = [];

      searchHtml.push('<div class="box">');
      searchHtml.push('<div class="widget-search">');
      searchHtml.push('<div class="input">');
      searchHtml.push('<input type="text" class="text" autocomplete="off" id="searchInput" placeholder="输入股票名称/股票代码" value="' + t + '"/>');
      searchHtml.push('</div>');
      searchHtml.push('<ul id="searchResult"><!-- 搜索的股票结果 --></ul>');
      searchHtml.push('</div>');
      searchHtml.push('</div>');

      return searchHtml.join('');
    },

    //键盘事件，上移或者下移
    inputKeyupHandle: function() {
      $(document).on('keyup', '#searchInput', function(t) {
        return '40' === t.which ? (StockAutoComplete.moveDownList(), !1) : '38' === t.which ? (StockAutoComplete.moveUpList(), !1) : '13' === t.which ? (StockAutoComplete.selectStockAtList(), !1) : void StockAutoComplete.autocomplete();
      });
    },

    //搜索框获取焦点
    inputFocusHandle: function() {
      $(document).on('focus', '#searchInput', function() {
        StockAutoComplete.autocomplete();
        $(this).parent().addClass('focus');
      });
    },

    //搜索框失去焦点
    inputBlurHandle: function() {
      $(document).on('blur', '#searchInput', function() {
        // -start
        // jshint报错 2016.3.16 qiulijun修改
        // 以下是原代码
        // StockAutoComplete.autocompte_result_active || StockAutoComplete.hideStocks();
        if( !StockAutoComplete.autocompte_result_active ) {
          StockAutoComplete.hideStocks();
        }
        // -end
        $(this).parent().removeClass('focus');
      });
    },

    //鼠标选择结果时
    stocksMouseenterHandle: function() {
      $(document).on('mouseenter', '.ac-add-stack-item', function() {
        StockAutoComplete.autocompte_result_active = !0;
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
      });
    },

    //鼠标移开时
    stocksMouseleaveHandle: function() {
      $(document).on('mouseleave', '.ac-add-stack-item', function() {
        StockAutoComplete.autocompte_result_active = !1;
      });
    },

    //鼠标点击时
    stocksClickHandle: function(editor, dom, dialog) {

      if(!StockAutoComplete.dialog_active){
        $(document).on("click", '.ac-add-stack-item', function() {
          StockAutoComplete.addToStockList($(this), editor, dom);
          StockAutoComplete.hideStocks();
          StockAutoComplete.clearUserInput();
        });
      }
      $(document).on("click", '.ac-add-stack-item', function() {
        dialog.close();
      });
    },

    //自动匹配
    autocomplete: function() {
      var t = $.trim($('#searchInput').val()),
          params = {};

          params['condition'] = t;
          params['flag'] = 1;

      return 0 === t.length ? (this.hideStocks(), !1) : $.ajax({
        type: "POST",
        url : API.searchStk,
        data: JSON.stringify(params),
        dataType:"json",
        contentType:"application/json",
        success: function(data) {
          if(data.code === 0){
            var t = data.result;
            var stks = t.stks ? t.stks : [];
            $.trim($('#searchInput').val()) === $.trim($('#searchInput').val()) && (stks.length > 0 ? StockAutoComplete.displayStocks(stks, $.trim($('#searchInput').val())) : StockAutoComplete.noResult());
          }else {
            console.log("通信异常，请稍后重试");
          }
        },
        error: function(){
          console.log("通信异常，请稍后重试");
        }
      });
    },

    //搜索到股票后显示
    displayStocks: function(t, e) {
      $("#searchResult li").remove();
      $.each(t, function(a) {
        var i = '<li class="ac-add-stack-item" stkCode="' + t[a].id + '">';
        i += '<span class="code">' + StockAutoComplete.highlightUserInput(t[a].id, e) + "</span>";
        i += '<span class="name">' + StockAutoComplete.highlightUserInput(t[a].name, e) + "</span>";
        i += StockAutoComplete.checkStkStatus(t[a].status)+"</li>";
        $('#searchResult').append(i);
      });
      $('#searchResult').fadeIn();
      this.activeFirstItem();
    },

    //显示结果后第一条记录加上选中样式
    activeFirstItem: function() {
      $("#searchResult li:first").addClass('active').siblings().removeClass('active');
    },

    //隐藏结果列表
    hideStocks: function() {
      $('#searchResult').fadeOut();
      "" === $.trim($('#searchInput').val()) && $("#searchResult li").remove();
    },

    //没有搜索结果时显示相应文字
    noResult: function() {
      $("#searchResult li").remove();
      var t = "<li>\u6ca1\u6709\u627e\u5230\u5bf9\u5e94\u8bb0\u5f55\uff0c\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u5173\u952e\u8bcd</li>";
      $('#searchResult').append(t).fadeIn();
    },

    //清除搜索框内容
    clearUserInput: function() {
      $('#searchInput').val("");
    },

    //在结果中高亮搜索结果
    highlightUserInput: function(t, e) {
      var a = new RegExp(e, "i");
      return t.replace(a, "<em>" + e.toUpperCase() + "</em>");
    },

    //向下
    moveDownList: function() {
      var t = $("#searchResult li").filter(".active");
      0 === t.length || 0 === t.next().length ? $("#searchResult li").filter(":first").addClass('active') : t.next().addClass('active');
      t.removeClass('active');
    },

    //向上
    moveUpList: function() {
      var t = $("#searchResult li").filter(".active");
      0 === t.length || 0 === t.prev().length ? $("#searchResult li").filter(":last").addClass('active') : t.prev().addClass('active');
      t.removeClass('active');
    },

    //在选中的条目上出发点击事件
    selectStockAtList: function() {
      $("#searchResult li").filter(".active").trigger("click");
    },

    //加入股票列表[作废，不采用这种方式]
    /*addToStockList: function(t, editor, dom) {
      var code = $(t).attr("stkCode"),
          name = $(t).find("span.name").text(),
          status = $(t).find("span.status").text(),
          href = 'http://localstock.yiqiniu.com?stockname=' + encodeURI(name) + '&assetid=' + code + '&type=28',
          stockLink = dom.getParent(editor.selection.getNode(), 'a[href]');

      if (stockLink) {
        editor.focus();
        stockLink.textContent = name;
        dom.setAttribs(stockLink, {href: href});
        editor.selection.select(stockLink);
        editor.undoManager.add();
      } else {
        editor.insertContent(dom.createHTML('a', {href: href}, dom.encode(name)));
      }
    },*/

    //加入股票列表
    addToStockList: function(t, editor, dom) {
      var name = $(t).find("span.name").text();
      editor.insertContent(name);
    },

    //根据不同状态显示相应状态文字
    checkStkStatus : function(t){
      // -start
      // jshint报错 2016.3.16 qiulijun修改
      // 以下是原代码
      // switch(t){
      //   case 5 :
      //     return '<span class="status">未上市</span>';
      //   break;
      //   case 4 :
      //     return '<span class="status">退市</span>';
      //   break;
      //   case 3 :
      //     return '<span class="status">停牌</span>';
      //   break;
      //   default :
      //     return '';
      // }
      switch(t){
        case 5 :
          return '<span class="status">未上市</span>';
        case 4 :
          return '<span class="status">退市</span>';
        case 3 :
          return '<span class="status">停牌</span>';
        default :
          return '';
      }
      // -end
    }
  };

  return StockAutoComplete;
});