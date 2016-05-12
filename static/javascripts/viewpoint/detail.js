/*
 * 观点详情
 * @Author: 游行至
 */
require([
  'jquery',
  'common'
], function ($) {
  'use strict';

  /* 接口 */
  var API = {
    commentList: '/viewpoint/comments', // 评论列表
    likeList: '/viewpoint/like_list', // 点赞列表
    deleteAction: '/viewpoint/delete', // 删除
    interaction: '/viewpoint/save_interaction' // 评论、点赞
  };

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /* 最新拉取的评论ID和点赞ID */
  var lastCommentId = null;
  var lastLikeId = null;
  var viewpointId = $('#viewpointId').val();

  /*
   * 观点
   * @init: 初始化
   * @deleteViewpoint: 删除观点
   */
  SEMICOLON.viewpoint = {

    // 初始化
    init: function () {
      this.deleteViewpoint();
    },

    // 删除观点
    deleteViewpoint: function () {

      $('#delete').on('click', function (e) {
        e.preventDefault();

        var title = $('.detail-title h3').html();

        $.niuConfirm('确定删除<b>' + title + '</b>？', function () {
          var params = {};

          params['type'] = 'P';
          params['id'] = viewpointId;

          $.niuAjax(API.deleteAction, params, function (data) {

            if (data.code === 0) {

              $.niuNotice('删除成功！');

              setTimeout(function () {
                window.location.href = '/viewpoint/list';
              }, 1500);
            } else {
              $.niuAlert(data.message);
            }
          });
        });
      });
    }
  };

  /*
   * 评论
   * @init: 初始化
   * @getCommentList: 评论列表
   * @replyComment: 回复评论
   */
  SEMICOLON.comments = {

    // 初始化
    init: function () {
      this.getCommentList();
      this.clickReplyLink();
      this.newComment();
      this.saveReply();
      this.showDeleteBtn();
      this.deleteComment();
      this.textareaHeightAuto();
      this.clickLoadMore();
    },

    // 评论列表
    getCommentList: function () {

      var params = {};

      params['count'] = 10;
      params['viewpointId'] = viewpointId;
      params['readId'] = 0;

      $.niuAjax(API.commentList, params, function (data) {

        if (data.code === 0) {

          if (data.result) {

            // 如果有评论
            var cmts = data.result.comments;

            lastCommentId = cmts[cmts.length - 1].cmtId;
            $('#commentFeed').append(SEMICOLON.comments.itemHtml(cmts));

            if (cmts.length >= 10) {
              $('#ajaxLoadingComment').removeClass('hide');
            }
          } else {
            $('#commentFeed').append('<div class="qn-no-result"><ul><li><img src="/images/list_null.png" height="106"></li><li>还没有人评论！</li></ul></div>');
          }
        } else {
          // 提示加载失败
          $.niuNotice(data.message);
        }
      });
    },

    // 增量拉取评论
    getMoreComments: function () {
      var params = {};

      params['count'] = 10;
      params['viewpointId'] = viewpointId;
      params['readId'] = lastCommentId;

      $.niuAjax(API.commentList, params, function (data) {

        if (data.code === 0) {

          if (data.result) {

            // 如果有评论
            var cmts = data.result.comments;

            lastCommentId = cmts[cmts.length - 1].cmtId;
            $('#commentFeed').append(SEMICOLON.comments.itemHtml(cmts));

            if (cmts.length < 10) {
              $('#ajaxLoadingComment').html('没有更多评论').data('over', 'Y');
            } else {
              $('#ajaxLoadingComment').html('查看更多');
            }
          } else {
            $('#ajaxLoadingComment').html('没有更多评论').data('over', 'Y');
          }
        } else {
          // 提示加载失败
          $.niuNotice(data.message);
        }

        $('#ajaxLoadingComment').data('active', 'N');
      });
    },

    // 列表html
    itemHtml: function (cmts) {

      var _html = '',
        cuId = $('#header-user-avatar-box').data('id');

      for (var i = 0; i < cmts.length; i++) {
        // 如果是投顾，要显示V
        // 暂时所有用户都不能跳转用户空间
        // 是否能跳入主页

        _html += '<li class="comment-item" data-id="' + cmts[i].cmtId + '" data-uid="' + cmts[i].fromUserComment.uId + '">';
        _html += '<div class="qn-avatar">';
        _html += '<img src="' + cmts[i].fromUserComment.uImg + '"/>';

        if (cmts[i].fromUserComment.uType === 2) {
          _html += '<em class="qn-vip"></em>';
        }

        _html += '</div>';
        _html += '<div class="comment-content">';
        _html += '<a href="javascript:;" class="user-name">' + $.toEmoji(cmts[i].fromUserComment.uName) + '</a>';

        if (cmts[i].toUserComment) {
          _html += '<i>回复</i><a href="javascript:;" class="user-name">' + $.toEmoji(cmts[i].toUserComment.uName) + '</a>';
        }

        _html += '<span>：' + $.toEmoji(cmts[i].content.strFilter()) + '</span>';
        _html += '</div>';
        _html += '<div class="row comment-meta">';
        _html += '<div class="col-xs-6">';
        _html += '<span class="date">' + $.timeDifference(cmts[i].commentTs) + '</span>';
        _html += '</div>';
        _html += '<div class="col-xs-6 text-right">';

        if (cmts[i].permission) {
          _html += '<a class="qn-btn link J-comment-delete hide" href="javascript:;">删除</a>';
        }

        if (cmts[i].fromUserComment.uId !== cuId) {
          _html += '<a href="javascript:" data-active="N" class="qn-btn link J-comment-reply">回复</a>';
        }

        _html += '</div>';
        _html += '</div>';
        _html += '</li>';
      }

      return _html;
    },

    // 提交评论
    newComment: function () {

      $(document).on('click', '.J-comment-new', function (e) {
        e.preventDefault();

        var ele = $(this),
          params = {};

        params['type'] = 'R';
        params['viewpointId'] = viewpointId;
        params['content'] = $.trim(ele.closest('.comment-reply').find('.qn-form-control').val().strFilter());

        if (params['content'] === "") {
          $.niuNotice('评论不能为空！');
          return;
        }

        if (params['content'].length > 500) {
          $.niuNotice('评论不能超过500字');
          return;
        }

        if (ele.hasClass('locked')) {
          return;
        }
        ele.addClass('locked');

        ele.addClass('disabled').html('提交中...');

        $.niuAjax(API.interaction, params, function (data) {

          if (data.code === 0) {
            // 提交回复成功，将返回的代码拼接
            var cmts = [];
            cmts[0] = data.result.dataObject;
            $('#commentFeed').prepend(SEMICOLON.comments.itemHtml(cmts));
            ele.removeClass('disabled').removeClass('locked').html('评论');
            ele.closest('.comment-reply').find('.qn-form-control').val('').trigger('keyup');

            // 更新数量
            SEMICOLON.comments.updateCommentNum('add');

            // 如果这是第一条评论，去掉“还没有任何评论”的提示图片;
            if($("#commentFeed .qn-no-result").length > 0){
              $('#commentFeed').children(".qn-no-result").remove();
            }

          } else {
            $.niuAlert(data.message);
            ele.removeClass('locked');
            ele.removeClass('disabled').html('评论');
          }
        }, function () {
          $.niuAlert('提交失败，请重试！');
          ele.removeClass('locked');
        });
      });
    },

    // 点击回复
    clickReplyLink: function () {

      $(document).on('click', '.J-comment-reply', function (e) {
        e.preventDefault();

        var ele = $(this),
          _html = [];

        if (ele.data('active') === 'Y') {
          ele.closest('.comment-item').find('.comment-reply').remove();
          ele.data('active', 'N');
        } else {
          _html.push('<div class="qn-comment-form comment-reply">');
          _html.push('<div class="qn-comment-form-textarea">');
          _html.push('<textarea class="qn-form-control J-comment-textarea" placeholder="写下你的评论..." data-limit-num="500"></textarea>');
          _html.push('<em class="limit-num">500</em>');
          _html.push('</div>');
          _html.push('<div class="qn-comment-form-actions">');
          _html.push('<a class="qn-btn sm primary J-reply-save" href="javascript:">评论</a>');
          _html.push('</div></div>');

          ele.closest('.comment-item').append(_html.join(''));
          ele.data('active', 'Y');
        }
      });
    },

    // 提交回复
    saveReply: function () {

      $(document).on('click', '.J-reply-save', function (e) {
        e.preventDefault();

        var ele = $(this),
          params = {};

        params['type'] = 'R';
        params['viewpointId'] = viewpointId;
        params['toUId'] = ele.closest('.comment-item').data('uid');
        params['content'] = $.trim(ele.closest('.comment-reply').find('.qn-form-control').val().strFilter());

        if (params['content'] === "") {
          $.niuNotice('评论不能为空！');
          return;
        }

        if (params['content'].length > 500) {
          $.niuNotice('回复不能超过500字');
          return;
        }

        if (ele.hasClass('locked')) {
          return;
        }
        ele.addClass('locked');

        ele.addClass('disabled').html('提交中...');

        $.niuAjax(API.interaction, params, function (data) {

          if (data.code === 0) {
            // 提交回复成功，将返回的代码拼接
            var cmts = [];
            cmts[0] = data.result.dataObject;
            ele.closest('.comment-reply').remove();
            $('#commentFeed').prepend(SEMICOLON.comments.itemHtml(cmts));

            // 更新数量
            SEMICOLON.comments.updateCommentNum('add');
          } else {
            $.niuAlert(data.message);
            ele.removeClass('locked');
          }
        }, function () {
          $.niuAlert('提交失败，请重试！');
          ele.removeClass('locked');
        });
      });
    },

    // 移入显示删除按钮
    showDeleteBtn: function () {

      $(document).on('mouseover', '.comment-item', function () {
        $('.J-comment-delete', this).removeClass('hide');
      }).on('mouseout', '.comment-item', function () {
        $('.J-comment-delete', this).addClass('hide');
      });
    },

    // 删除评论
    deleteComment: function () {

      $(document).on('click', '.J-comment-delete', function (e) {
        e.preventDefault();

        var ele = $(this);

        $.niuConfirm('确定删除吗？', function () {
          var item = ele.closest('.comment-item'),
            params = {};

          params['type'] = 'R';
          params['id'] = item.data('id');

          $.niuAjax(API.deleteAction, params, function (data) {

            if (data.code === 0) {
              item.remove();

              // 更新数量
              SEMICOLON.comments.updateCommentNum();

              // 当删除最后一条评论是，显示“还没有人评论！”
              if($(".comment-item").length === 0){
                $("#commentFeed").append('<div class="qn-no-result"><ul><li><img src="/images/list_null.png" height="106"></li><li>还没有人评论！</li></ul></div>');
              }

            } else {
              $.niuAlert(data.message);
            }
          });
        });
      });
    },

    // 回复框高度自适应
    textareaHeightAuto: function () {

      // 创建pre元素
      $(document).on('focus', '.J-comment-textarea', function () {
        if (!$(this).siblings('pre').length) {
          $(this).parent().append($('<pre>'));
        }
      });

      // 输入动作
      $(document).on('mousedown blur', '.J-comment-textarea', function () {
        $(this).siblings('pre').empty().html($(this).val());
        $(this).css('height', $(this).siblings('pre').height() + 14);
      });

      // 输入动作
      $(document).on('keyup', '.J-comment-textarea', function (e) {

        if (e.which !== 13) {

          var ele = $(this),
            pre = ele.siblings('pre'),
            limitBox = ele.siblings('.limit-num'),
            text = ele.val() || '',
            limitNum = ele.data('limit-num'),
            height;

          // 先转义
          var textFiltered = text.strFilter();


          if (text.length > limitNum) {
            limitBox.addClass('warning').html(limitNum - text.length);
          } else {
            limitBox.removeClass('warning').html(limitNum - text.length);
          }

          setTimeout(function () {
            ele.val(textFiltered);
            ele.siblings('pre').html(textFiltered);
            ele.css('height', ele.siblings('pre').height() + 14);
          }, 20);

        }
      });

      // 换行
      $(document).on('keydown', '.J-comment-textarea', function (e) {
        if (e.which === 13) {
          $(this).css('height', $(this).height() + 34);
        }
      });
    },

    // 查看更多
    clickLoadMore: function () {
      $('#ajaxLoadingComment').on('click', function (e) {
        e.preventDefault();

        var ele = $(this),
          over = ele.data('over'),
          active = ele.data('active');

        if (over === 'Y' || active === 'Y') {
          return;
        }

        ele.html('<img src="/images/loading.gif">正在加载中，请稍候...');
        setTimeout(function () {
          SEMICOLON.comments.getMoreComments();
        }, 250);
      });
    },

    // 更新评论数量
    updateCommentNum: function (type) {

      var num = parseInt($('#commentNum').text());

      if (type === 'add') {
        $('#commentNum').html(++num);
      } else {
        $('#commentNum').html(--num);
      }
    }
  };

  /*
   * 点赞
   * @init: 初始化
   * @getLikeList: 获取点赞列表
   */
  SEMICOLON.likes = {

    // 初始化
    init: function () {
      this.getLikeList();
      this.clickLoadMore();
    },

    // 获取点赞列表
    getLikeList: function () {

      // 获取观点id
      var params = {},
        _html = '';

      params['count'] = 10;
      params['viewpointId'] = viewpointId;
      params['readId'] = 0;

      $.niuAjax(API.likeList, params, function (data) {

        if (data.code === 0) {

          // 有普通用户点赞
          if (data.result.viewpointLikes) {
            var likeList = data.result.viewpointLikes;

            for (var i = 0; i < likeList.length; i++) {

              _html += '<li class="thumbs-item">';
              _html += '<div class="qn-avatar">';
              _html += '<img src="' + likeList[i].likeUserComment.uImg + '"/>';

              if (likeList[i].likeUserComment.uType === 2) {
                _html += '<em class="qn-vip"></em>';
              }

              _html += '</div>';
              _html += '<div class="user-name">';
              _html += $.toEmoji(likeList[i].likeUserComment.uName);
              _html += '</div>';
              _html += '</li>';
            }

            // 判断奇数
            if (likeList.length % 2 === 1) {
              _html += '<li class="thumbs-item"></li>';
            }

            //$('#thumbFeed').append(_html);
            lastLikeId = likeList[likeList.length - 1].likeId;

            if (likeList.length >= 10) {
              $('#ajaxLoadingLike').removeClass('hide');
            }


          }
          // 有匿名用户点赞
          if (typeof data.result.guestNum !== undefined && data.result.guestNum > 0) {

            _html += '<li class="thumbs-item">';
            _html += '<div class="qn-avatar">';
            _html += '<img src="/images/default_avatar_visitor.png" height="36" width="36"/>';
            _html += '</div>';
            _html += '<div class="user-name">';
            _html += '有' + data.result.guestNum + '个匿名用户点赞';
            _html += '</div>';
            _html += '</li>';
            _html += '<li class="thumbs-item"></li>';

          }
          $('#thumbFeed').append(_html);

          // 暂无点赞
          if (!data.result.viewpointLikes && data.result.guestNum === 0) {
            $('#thumbFeed').append('<div class="qn-no-result"><ul><li><img src="/images/list_null.png" height="106"></li><li>还没有人点赞！</li></ul></div>');
          }
        } else {
          // 加载失败
          $('#thumbFeed').append('<div class="text-center">' + data.message + '</div>');
        }
      });
    },

    // 增量拉取点赞列表
    getMoreLikeList: function () {

      // 获取观点id
      var params = {};

      params['count'] = 10;
      params['viewpointId'] = viewpointId;
      params['readId'] = lastLikeId;

      $.niuAjax(API.likeList, params, function (data) {

        if (data.code === 0) {

          if (data.result.viewpointLikes) {

            var likeList = data.result.viewpointLikes,
              _html = '';

            for (var i = 0; i < likeList.length; i++) {
              _html += '<li class="thumbs-item">';
              _html += '<div class="qn-avatar">';
              _html += '<img src="' + likeList[i].likeUserComment.uImg + '"/>';
              _html += '</div>';
              _html += '<div class="user-name">';
              _html += $.toEmoji(likeList[i].likeUserComment.uName);
              _html += '</div>';
              _html += '</li>';
            }

            // 判断奇数
            if (likeList.length % 2 === 1) {
              _html += '<li class="thumbs-item"></li>';
            }

            $('#thumbFeed').append(_html);
            lastLikeId = likeList[likeList.length - 1].likeId;

            if (likeList.length < 10) {
              $('#ajaxLoadingLike').html('没有更多点赞').data('over', 'Y');
            } else {
              $('#ajaxLoadingLike').html('查看更多');
            }
          } else {
            $('#ajaxLoadingLike').html('没有更多点赞').data('over', 'Y');
          }
        } else {
          $.niuNotice(data.message);
        }

        $('#ajaxLoadingLike').data('active', 'N');
      });
    },

    // 查看更多
    clickLoadMore: function () {
      $('#ajaxLoadingLike').on('click', function (e) {
        e.preventDefault();

        var ele = $(this),
          over = ele.data('over');

        if (over === 'Y') {
          return;
        }

        ele.html('<img src="/images/loading.gif">正在加载中，请稍候...');
        setTimeout(function () {
          SEMICOLON.likes.getMoreLikeList();
        }, 250);
      });
    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化
   */
  SEMICOLON.documentOnReady = {

    //初始化
    init: function () {
      SEMICOLON.viewpoint.init();
      SEMICOLON.comments.init();
      SEMICOLON.likes.init();
      SEMICOLON.documentOnReady.footerTabToggle();
    },

    //切换点赞，评论
    footerTabToggle: function () {
      $('#footerTab').on('click', 'li', function (e) {
        e.preventDefault();

        $('#footerTab > li').removeClass('active');
        $(this).addClass('active');
        $('.J-detail-footer').addClass('hide');
        $('#' + $(this).data('tag')).removeClass('hide');
      });
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});