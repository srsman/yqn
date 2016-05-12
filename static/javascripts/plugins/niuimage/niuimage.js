/**
 * 一起牛插入图片插件
 *
 * Created by ayou on 2016-02-22.
 */
define([
  'jquery',
  'tinymce'
], function ($) {
  'use strict';

  /* 接口 */
  var API = {
    uploadImg: '/viewpoint/upload', // 上传图片
    uploadProgress: '/viewpoint/uploadPrg' // 上传图片进度条
  };

  // 允许上传的类型
  var allowType = 'jpeg,jpg,png,gif';
  var allowSize = 1024 * 1024 * 5; // 单位：m
  var isUpload = false;
  var dialogNum = 0; // 上传图片对话框的序号

  /*checkFileTypeAndSize: 上传图片*/
  $.fn.checkFileTypeAndSize = function (options) {
    //默认设置
    var defaults = {
      allowedExtensions: 'jpeg,jpg,png,gif',
      maxSize: 2 * 1024 * 1024 * 1024, //单位是byte
      success: function () {
      },
      extensionerror: function () {
      },
      sizeerror: function () {
      }
    };
    //合并设置
    options = $.extend(defaults, options);
    //遍历元素
    return this.each(function () {
      $(this).on('change', function () {
        //获取文件路径
        var filePath = $(this).val();
        // 没有选择文件，直接返回
        if( !filePath ) {
          return ;
        }
        //小写字母的文件路径
        var fileLowerPath = filePath.toLowerCase();
        //获取文件的后缀名
        var extension = fileLowerPath.substring(fileLowerPath.lastIndexOf('.') + 1);
        //判断后缀名是否包含在预先设置的、所允许的后缀名数组中
        if ($.inArray(extension, options.allowedExtensions.split(",")) === -1) {
          options.extensionerror();
          $(this).focus();
        } else {
          try {
            var size = 0;
            if ($.browser && $.browser.msie) {//ie旧版浏览器
              var fileMgr = new ActiveXObject("Scripting.FileSystemObject");
              var fileObj = fileMgr.getFile(filePath);
              size = fileObj.size; //byte
            } else {//其它浏览器
              size = $(this)[0].files[0].size;//byte
            }
            if (size > options.maxSize) {
              options.sizeerror();
            } else {
              options.success();
            }
          } catch (e) {
            console.log("错误：" + e);
          }
        }
      });
    });
  };

  var niuImage = {
    init: function () {
      tinymce.PluginManager.add('niuimage', function (editor) {
        var dialog = null;
        // 显示弹窗界面
        function initialize() {
          var imageHtml = [];
          imageHtml.push('<div id="uploadContainer">');
          imageHtml.push('<label id="uploadBtnFake" for="uploadBtn">上传</label>');
          imageHtml.push('<div id="uploadText"><p>允许的图片类型：' + allowType + '</br>允许的图片大小：' + allowSize/1024/1024 + 'm</p></div>');
          imageHtml.push('<div id="clearFloat"></div>');
          imageHtml.push('<div id="error"></div>');
          imageHtml.push('<form id="imageForm" action="" method="post" enctype="multipart/form-data">');
          imageHtml.push('<input id="uploadBtn" name="file" type="file" style="display: none"/>');
          imageHtml.push('</form>');
          //imageHtml.push('<progress id="uploadProgress" value="0">0%</progress>');
          imageHtml.push('<div class="image-thumb" id="imageThumb" /></div>');
          imageHtml.push('<input id="imageUrl" type="hidden"/></input>');
          imageHtml.push('</div>');
          dialog = editor.windowManager.open({
            title: '上传文件',
            html: imageHtml.join(''),
            width: 400,
            height: 150,
            buttons: [{
              text: '插入',
              classes: 'widget btn primary first abs-layout-item',
              disabled: false,
              onclick: insert
            },
              {
                text: '关闭',
                onclick: function() {
                  // 对话框序号加一
                  dialogNum ++;
                  this.parent().parent().close();
                }
              }]
          });
          //上传文件
          niuImage.upload();
          // 清除提示信息
          niuImage.clearError();
        }

        // 在tinymce中增加插件图标
        editor.addButton('niuimage', {
          icon: 'image',
          tooltip: '插入图片',
          onclick: initialize
        });
        // 将文件路径添加到文本框中
        function insert() {
          // 对话框序号加一
         dialogNum ++;
          if(!isUpload) {
            return ;
          }
          // 得到路径
          var imagePath = $('#imageUrl').val();
          if(imagePath) {
            // 将路径插入到editor中
            editor.insertContent(editor.dom.createHTML('img', {src: imagePath}));
          }
          // 关闭对话框
          this.parent().parent().close();
        }
      });
    },
    // 上传图片
    upload: function () {
      $('#uploadBtn').checkFileTypeAndSize({
        allowedExtensions: allowType,
        maxSize: allowSize,
        success: function () {
          var _num = dialogNum;
          $('#imageThumb').css('background-image', 'url(/images/loading.gif)');
          $('#imageUrl').val('');
          $('.mce-reset button').eq(1).attr('disabled','disabled');
          var fileObj = document.getElementById('uploadBtn').files[0];
          var form = new FormData();
          form.append('file', fileObj);
          $.ajax({
            url: API.uploadImg,
            type: 'POST',
            data: form,
            async: true, // 进度条需要异步上传
            cache: false,
            contentType: false,
            processData: false,
            success: function (data) {
              if (data.code === 0) {
                if(_num === dialogNum) {
                  isUpload = true;
                  $('#imageUrl').val(data.result);
                  setTimeout(function(){
                    $('#imageThumb').css('background-image', 'url('+data.result+')');
                    $('.mce-reset button').eq(1).removeAttr('disabled');
                  },3000);
                }
              } else {
                $('#uploadBtn').val(null);
                $('#imageUrl').val('');
                $('#imageThumb').css('background-image', 'url("/images/upload_placeholder.jpg")');
                $('.mce-reset button').eq(1).removeAttr('disabled');
                $('#error').html(data.message);
              }
            },
            error: function (error) {
              $('#uploadBtn').val(null);
              $('#imageUrl').val('');
              $('#imageThumb').css('background-image', 'url("/images/upload_placeholder.jpg")');
              $('.mce-reset button').eq(1).removeAttr('disabled');
              $('#error').html(error);
            }
          });
          // 进度条
          // niuImage.onProgress();
        },
        extensionerror: function () {
          $('#error').html('图片类型错误');
        },
        sizeerror: function () {
          $('#error').html('图片大小超出限制');
        }
      });
    },
    // 进度条java版
    //onProgress: function(file) {
    //  if (file.lengthComputable) {
    //    var per = Math.floor(file.loaded / file.total);
    //    $("#uploadProgress").val(per);
    //  }
    //},
    // 进度条node版
    onProgress: function () {
      $.ajax({
        url: API.uploadProgress,
        dataType: 'json',
        success: function (data) {
          var progress = data.value;
          $("#uploadProgress").val(progress/100.0);
          if (progress < 100) {
            setTimeout(niuImage.onProgress, 1);
          }
        }
      });
    },
    // 点击上传时，清除提示信息
    clearError: function() {
      $('#uploadBtn').click(function () {
        $('#error').html('');
      });
    }
  };
  return niuImage;
});


