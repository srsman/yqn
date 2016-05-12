/*
 * 发布观点
 * @Author: qinxingjun
 */

require([
  'jquery',
  'niuimage',
  'niustock',
  'tinymce',
  'common'
], function($, niuimage, niustock) {
  'use strict';

  /* 接口 */
  var API = {
    saveViewpoint : '/viewpoint/new' // 发布观点
  };

  // 富文本框对象
  var tinymce = window.tinymce;

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  var titleLength = 30;//观点标题长度
  var contentLength = 20000;//内容长度

  /*
   * 发布新观点
   * @init: 初始化
   * @tinymceConfig: 富文本框配置
   * @saveViewpoint: 发布观点
   */
  SEMICOLON.creater = {

    // 初始化
    init: function() {
      this.tinymceConfig();
      this.saveViewpoint();
    },

    // 富文本框配置
    tinymceConfig: function() {

      tinymce.init({
        selector: '#vContent', // 目标ID
        menubar: false, // 隐藏菜单栏
        font_formats: 'Andale Mono=andale mono,times;', // 字体
        content_css: '/javascripts/lib/tinymce/css/content.css', // 内容样式表
        skin_url: '/javascripts/lib/tinymce/skins/yiqiniu',
        plugins:[
          'preview link paste niustock niuimage'
        ], // 引入的插件
        /*plugins:[
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table contextmenu paste'
        ], // 引入的插件*/
        toolbar: 'insertfile undo redo | fontsizeselect | bold italic underline strikethrough superscript subscript link | niustock niuimage | alignleft aligncenter alignright alignjustify' +
        ' | bullist numlist | outdent indent | preview',
        relative_urls: false,
        height: 340, // 文本框高度
        max_height: 340, // 最大高度
        resize: false, //不允许调整高度
        //paste_auto_cleanup_on_paste : true,
        //paste_remove_styles: true,
        //paste_remove_styles_if_webkit: true,
        //paste_strip_class_attributes: true,

        // 去掉粘贴中的标签
        paste_as_text : true
      });
    },

    // 生成摘要
    extractSummary: function(str) {

      var text = str.replace(/<[^>]+>/g, "");
      return text.substr(0,140);
    },

    // 提取第一张图片
    extrachFirstImgUrl: function(str) {
      $('#firstImgUrl').html(str);
      var $img = $('#firstImgUrl img').first();
      if($img){
        return $img.attr('src');
      }else{
        return null;
      }
    },

    // 发布观点
    saveViewpoint: function() {


      $('#vSubmitBtn').on('click', function(){

        var ele = $(this),
            title = $.trim($('#vTitle').val()),
            content = tinymce.get('vContent').getContent({format: 'raw'}),
            contentText = tinymce.get('vContent').getContent({format: 'text'}),
            params = {};

        // 校验标题
        // 标题为空
        if(title === ''){
          $.niuNotice('观点标题不能为空！');
          $('#vTitle').focus();
          return;
        }
        // 标题过长
        if(title.length > titleLength){
          $.niuNotice("观点标题不能超过" + titleLength + "个字符！");
          $('#vTitle').focus();
          return;
        }

        // 校验内容
        // 内容为空
        function isNull(){
          if (contentText === "") {
            return true;
          }
          if(contentText.replace(/^\s*|\s$/g,'').length===0){
            return true;
          }
          return false;
        }
        if(isNull()){
          $.niuNotice('观点内容不能为空!');
          return;
        }
        // 内容过长
        if(content.length > contentLength) {
          $.niuNotice("观点内容过长！");
          return;
        }

        if(ele.hasClass('locked')){
          return ;
        }
        ele.addClass('locked');
        ele.addClass('disabled').html('发布中...');

        params['id'] = $.onlyNum();
        params['viewpointType'] = 'P';
        params['title'] = $.trim($('#vTitle').val());
        params['summary'] = SEMICOLON.creater.extractSummary(content);
        var firstImg = SEMICOLON.creater.extrachFirstImgUrl(content);
        if(firstImg) {
          params['firstImg'] = firstImg;
        }
        params['content'] = content;


        $.niuAjax(API.saveViewpoint, params, function(data) {

          if(data.code === 0){

            $.niuNotice('发布成功！');

            setTimeout(function(){
              window.location.href='/viewpoint/detail/'+ data.result.viewpointId;
            },1500);
          } else{
            $.niuAlert(data.message);
            ele.removeClass('disabled').html('发布');
            ele.removeClass('locked');
          }
        });
      });
    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化
   * @showWrap: 显示内容区，主要解决富文本框显示慢的问题
   */
  SEMICOLON.documentOnReady = {

    //初始化
    init: function() {
      SEMICOLON.creater.init();
      SEMICOLON.documentOnReady.showWrap();
      niustock.init(); // 引入插入股票插件
      niuimage.init(); // 引入插入图片插件
    },

    // 显示内容区
    showWrap: function() {
      setTimeout(function(){
        $('#newWrap').css('visibility','visible');
      },100);
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});