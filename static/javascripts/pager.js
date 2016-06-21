/*
 * IM
 * @Author: 大发
 */

require([
  'jquery',
  'formValidation'
], function($) {
  'use strict';

  var userType = $('#header-user-avatar-box').data('type'), // 用户类型
      imId = $('#qn-pager-minimize').data('im_id'), // 环信ID
      imToken = $('#qn-pager-minimize').data('im_token'), // 环信Token
      easemobConn = null, // 环信的连接实例
      curUserId = null, // 当前环信用户的环信ID
      curChatId = null, // 当前聊天对象的环信ID
      curChatType = null, // 当前聊天的类型, chat: 单聊, groupchat: 群聊
      scrollTop = 0, // 好友列表滚动条的偏移
      getContacts = true, // 拉取联系人时防止重发
      fuzzyQueryGetResult = true, // 防止模糊查询重发
      textSending = false, // 防止频繁发送文本信息
      wordLimit = 5000, // 输入的限制字数
      msgImgMaxWidth = 400, // 图片信息最大宽度
      everyMinute, // 每分钟时间
      deleteMemberArray = [], // 删除群成员时的数组
      addMemberArray = [], // 邀请新成员时的数组
      // $pagerMinimize = $('#qn-pager-minimize'), // 消息最小化
      // $('#qn-pager-recent-box') = $('#qn-pager-recent-box'), // 最近联系人列表盒子
      // $contactsBox = $('#qn-pager-contacts-box'), // 联系人列表盒子
      // $chatBox = $('.qn-pager-chat-box'), // 聊天窗口的盒子
      $groupItem, // 分组项
      $contactsItem, // 联系人项
      $recentItem, // 最近会话项
      $fuzzyQueryResult, // 模糊查询结果集
      $chatWindow, // 聊天窗口
      $chatWindowOwnRoomOperate, // 群主视角聊天窗口操作
      $chatWindowRoomOperate, // 聊天窗口群操作
      $msgContainer, // 消息容器
      $msgSys, // 系统消息
      $msgTime, // 消息时间
      $msgBasis, // 普通消息项
      $msgImg, // 图片消息项
      $msgCustom, // 自定义消息项
      $msgReward, // 红包消息项
      $msgRewardInfo, // 红包详情
      $textSendHint, // 输入提示
      $badgeHtml, // 消息打点
      $getMoreMsgBtn, // 拉取更多聊天记录按钮
      $windowReturnBtn, // 窗口返回按钮
      $membersList, // 群成员列表
      $membersListItem, // 群成员列表行
      $noResultTr, // 无结果的table行
      $operateMembersBtns, // 群成员操作按钮
      $roomBasicInfo, // 群基本信息
      $roomAnnouncement, // 群公告
      $roomAuthentication, // 群身份认证
      $roomMemberOverview, // 群信息成员概览
      $roomPriceInfo, // 群消息价格设置
      $roomPriceSettings, // 群信息价格设置
      $logoutRoom; // 退出直播群按钮

  // 分组项
  $groupItem = $('<div class="qn-pager-contacts-group">' +
              '<div class="group-title">' +
              '<i class="fa fa-caret-right"></i>' +
              '</div>' +
              '<ul class="qn-pager-contacts-list">' +
              '</ul>' +
              '</div>');

  // 联系人项
  $contactsItem = $('<li class="contacts-item">' +
              '<a href="javascript:">' +
              '<div class="qn-avatar">' +
              '<img src="" width="36" height="36">' +
              '</div>' +
              '<h5 class="contacts-title"></h5>' +
              '</a>' +
              '</li>');

  // 最近会话项
  $recentItem = $('<li class="contacts-item">' +
              '<a href="javascript:">' +
              '<div class="qn-avatar">' +
              '<img src="" width="36" height="36">' +
              '</div>' +
              '<h5 class="contacts-title"></h5>' +
              '<p class="contacts-content"></p>' +
              '<i class="contacts-time"></i>' +
              '</a>' +
              '</li>');

  // 模糊查询结果集
  $fuzzyQueryResult = $('<div class="qn-pager-fuzzy-query-result qn-pager-fuzzy-query-identify">' +
                  '<ul class="qn-pager-contacts-list">' +
                  '</ul>' +
                  '</div>');

  // 聊天窗口
  $chatWindow = $('<div class="qn-pager-chat-item">' +
              '<div class="chat-header">' +
              '<span class="chat-title"></span>' +
              '</div>' +
              '<div class="chat-main">' +
              '<a href="javascript:" class="btn-chat-more">点击查看更多</a>' +
              '<ul class="chat-content">' +
              '</ul>' +
              '</div>' +
              '<div class="chat-footer">' +
              '<ul class="chat-msg-input-toolbar">' +
              // '<li>' +
              // '<a class="show-emotion-icon" href="javascript:"><i class="fa fa-smile-o"></i></a>' +
              // '<div class="chat-msg-input-toolbar-box hide">' +
              // '<div class="content">' +
              // '<ul class="chat-emotion-ul"></ul>' +
              // '<div class="arrow-box"><i></i><em></em></div>' +
              // '</div>' +
              // '</div>' +
              // '</li>' +
              // '<li>' +
              // '<a href="javascript:"><i class="fa fa-picture-o"></i></a>' +
              // '</li>' +
              '</ul>' +
              '<textarea class="chat-msg-input"></textarea>' +
              '<div class="chat-msg-submit">' +
              '<i>Ctrl&nbsp;+&nbsp;Enter换行</i>' +
              '<a href="javascript:" class="qn-btn primary xs chat-msg-submit-btn disabled">发送</a>' +
              '</div>' +
              '</div>' +
              '</div>');

  // 群主视角聊天窗口群操作
  $chatWindowOwnRoomOperate = $('<ul class="chat-header-secondary">' +
                        '<li>' +
                        '<a href="javascript:" class="show-manage-btn" title="群成员管理" data-mark="member-list" data-owner="1">' +
                        '<i class="fa fa-user-plus"></i>' +
                        '</a>' +
                        '</li>' +
                        '<li>' +
                        '<a href="javascript:" class="show-manage-btn" title="群信息设置" data-mark="room-info" data-owner="1">' +
                        '<i class="fa fa-cog"></i>' +
                        '</a>' +
                        '</li>' +
                        '</ul>');

  // 聊天窗口群操作
  $chatWindowRoomOperate = $('<ul class="chat-header-secondary">' +
                        '<li>' +
                        '<a href="javascript:" class="show-manage-btn" title="查看群信息" data-mark="room-info" data-owner="0">' +
                        '<i class="fa fa-search"></i>' +
                        '</a>' +
                        '</li>' +
                        '</ul>');

  // 消息容器
  $msgContainer = $('<li>' +
              '<div class="qn-avatar">' +
              '<img src="" width="36" height="36">' +
              '</div>' +
              '<div class="msg-wrap">' +
              '</div>' +
              '</li>');

  // 系统消息
  $msgSys = $('<li class="sys-msg">' +
          '<span></span>' +
          '</li>');

  // 消息时间
  $msgTime = $('<div class="sys-time">' +
          '<em class="line-left"></em>' +
          '<span class="time"></span>' +
          '<em class="line-right"></em>' +
          '</div>');

  // 普通消息项
  $msgBasis = $('<div class="msg-box">' +
          '<span class="msg-arrow"><i></i><em></em></span>' +
          '</div>');

  // 图片消息项
  $msgImg = $('<div class="msg-box img">' +
        '<span class="msg-arrow"><i></i><em></em></span>' +
        '</div>');

  // 自定义消息项
  $msgCustom = $('<div class="msg-box custom">' +
                '<span class="msg-arrow"><i></i><em></em></span>' +
                '<div class="msg-custom-main">' +
                '<h5></h5>' +
                '<div class="msg-custom-content">' +
                '<div class="custom-content-icon">' +
                '<img src="" width="63" height="63">' +
                '</div>' +
                '<div class="custom-content"></div>' +
                '</div>' +
                '</div>' +
                '</div>');

  // 红包消息项
  $msgReward = $('<div class="msg-box reward qn-reward-token">' +
                '<span class="msg-arrow"><i></i><em></em></span>' +
                '<div class="msg-reward-main">' +
                '<span class="reward-icon"></span>' +
                '</div>' +
                '<div class="msg-reward-footer">一起牛红包</div>' +
                '</div>');

  // 红包详情
  $msgRewardInfo = $('<div class="qn-popup-overlay">' +
                '<div class="qn-reward-info-box qn-reward-token">' +
                '<div class="qn-reward-info-header">' +
                '<span class="qn-avatar disable">' +
                '<img src="">' +
                '</span>' +
                '<h4 class="nickname"></h4>' +
                '</div>' +
                '<div class="qn-reward-info-main">' +
                '<p>群主辛劳人缘好，这个红包是<i class="nickname"></i>对群主的赞赏哦<p>' +
                '<span><i>元</i></span>' +
                '</div>' +
                '</div>' +
                '</div>');

  // 输入超限提示
  $textSendHint = $('<span class="chat-msg-submit-hint">' +
                '<i class="fa fa-times"></i>' +
                '</span>');

  // 消息打点
  $badgeHtml = $('<span class="qn-badge"></span>');

  // 拉取更多聊天记录按钮
  $getMoreMsgBtn = $('<a href="javascript:" class="btn-chat-more">点击查看更多</a>');

  // 窗口返回按钮
  $windowReturnBtn = $('<a href="javascript:" class="qn-pager-return-window hide-manage-btn">' +
                  '<i class="fa fa-chevron-left"></i>返回' +
                  '</a>');

  // 群成员列表
  $membersList = $('<table class="qn-table hover vertical-middle">' +
                '<thead>' +
                '<th>成员</th>' +
                '<th class="text-right">服务到期时间</th>' +
                '<th class="text-right">最后发言时间</th>' +
                '<th class="text-center">' +
                '<input type="checkbox" id="check-all-member" class="icheck delete-member-check">' +
                '</th>' +
                '</thead>' +
                '<tbody></tbody>' +
                '<tfoot>' +
                '<tr>' +
                '<td colspan="4"></td>' +
                '</tr>' +
                '</tfoot>' +
                '</table>');

  // 群成员列表行
  $membersListItem = $('<tr>' +
                  '<td>' +
                  '<span class="qn-avatar disable">' +
                  '<img src="">' +
                  '</span>' +
                  '</td>' +
                  '<td class="text-right"></td>' +
                  '<td class="text-right"></td>' +
                  '<td class="text-center">' +
                  '<input type="checkbox" class="icheck check-item-member delete-member-check">' +
                  '</td>' +
                  '</tr>');

  // 无结果的table行
  $noResultTr = $('<tr>' +
            '<td class="text-center" colspan="100"></td>' +
            '</tr>');

  // 群成员操作按钮
  $operateMembersBtns = $('<a href="javascript:" id="delete-room-member-btn" class="qn-btn">' +
                    '<i class="fa fa-trash"></i>删除成员' +
                    '</a>' +
                    '<a href="javascript:" id="add-room-member-btn" class="qn-btn info show-manage-btn" data-mark="add-member">' +
                    '<i class="fa fa-plus"></i>添加成员' +
                    '</a>');

  // 群基本信息
  $roomBasicInfo = $('<div class="qn-pager-room-description">' +
                '<div class="row">' +
                '<form id="qn-pager-settings-room-basic-form" action="/live_room/upload" method="post">' +
                '<div class="col-xs-8">' +
                '<span class="qn-avatar disable">' +
                '<img src="">' +
                '</span>' +
                '<dl>' +
                '<dt>' +
                '<div id="qn-pager-room-info-name" class="qn-form-group inline">' +
                '<div class="qn-form-control-box">' +
                '<input type="text" id="qn-pager-room-info-name-input" class="qn-form-control hide" name="qn_pager_room_info_name_input" placeholder="请填写直播群名称">' +
                '<p class="qn-control-static"></p>' +
                '</div>' +
                '</div>' +
                '</dt>' +
                '<dd>' +
                '<span></span>' +
                '<div id="qn-pager-room-info-description" class="n-form-group inline">' +
                '<div class="qn-form-control-box">' +
                '<textarea id="qn-pager-room-info-description-input" class="qn-form-control hide" name="qn_pager_room_info_description_input" placeholder="请填写直播群描述">' +
                '</textarea>' +
                '<p class="qn-control-static"></p>' +
                '</div>' +
                '</div>' +
                '</dd>' +
                '</dl>' +
                '</div>' +

                '<div class="col-xs-4 text-right">' +
                '<a href="javascript:" id="room-info-edit-basic-info" class="qn-btn primary">' +
                '<i class="fa fa-cog"></i>群信息设置' +
                '</a>' +
                '</div>' +
                '</form>' +
                '</div>' +
                '</div>');

  // 群公告
  $roomAnnouncement = $('<div class="qn-form-section">' +
                  '<span class="qn-form-section-title">群公告</span>' +
                  '<div class="row">' +
                  '<form id="qn-pager-settings-room-announcement-form" action="/live_room/upload" method="post">' +
                  '<div class="col-xs-8">' +
                  '<div id="qn-pager-room-info-announcement" class="qn-form-group inline">' +
                  '<div class="qn-form-control-box">' +
                  '<textarea id="qn-pager-room-info-announcement-input" class="qn-form-control hide" name="qn_pager_room_info_announcement_input" placeholder="请填写直播群公告">' +
                  '</textarea>' +
                  '<p class="qn-control-static"></p>' +
                  '</div>' +
                  '</div>' +
                  '</div>' +
                  '<div class="col-xs-4 text-right">' +
                  '<a href="javascript:" id="room-info-edit-notice-btn" class="qn-btn primary">' +
                  '<i class="fa fa-cog"></i>群公告设置' +
                  '</a>' +
                  '</div>' +
                  '<form>' +
                  '</div>' +
                  '</div>');

  // 群身份验证
  $roomAuthentication = $('<div class="qn-form-section">' +
                  '<span class="qn-form-section-title">身份验证</span>' +
                  '<div class="row">' +
                  '<form id="qn-pager-settings-room-authentication-form" action="/live_room/upload" method="post">' +
                  '<div class="col-xs-8">' +
                  '<div class="qn-form-group">' +
                  '<div class="qn-form-control-box">' +
                  '<p id="qn-pager-room-info-need-verify-html" class="qn-control-static"></p>' +
                  '</div>' +
                  '</div>' +
                  '<div class="qn-form-group special hide" style="margin-top: 0;">' +
                  '<div class="qn-form-control-box">' +
                  '<div class="qn-radio">' +
                  '<input type="radio" id="qn-pager-room-info-need-verify-n" name="need_verify" class="icheck setting-verify-radio" value="N">' +
                  '<label for="qn-pager-room-info-need-verify-n">所有客户可加入<label>' +
                  '</div>' +
                  '<div class="qn-radio">' +
                  '<input type="radio" id="qn-pager-room-info-need-verify-y" name="need_verify" class="icheck setting-verify-radio" value="Y">' +
                  '<label for="qn-pager-room-info-need-verify-y">需我验证通过才能加入<label>' +
                  '</div>' +
                  '</div>' +
                  '</div>' +
                  '</div>' +
                  '<div class="col-xs-4 text-right">' +
                  '<a href="javascript:" id="room-info-edit-authentication-btn" class="qn-btn primary">' +
                  '<i class="fa fa-cog"></i>身份验证设置' +
                  '</a>' +
                  '</div>' +
                  '</form>' +
                  '</div>' +
                  '</div>');

  // 群信息成员概览
  $roomMemberOverview = $('<div class="qn-form-section">' +
                    '<span class="qn-form-section-title">群成员</span>' +
                    '<div class="row">' +
                    '<div class="col-xs-7">群成员</div>' +
                    '<div class="col-xs-5 text-right">' +
                    '<a href="javascript:" id="room-info-read-member-btn" class="qn-btn show-manage-btn" data-mark="member-list">' +
                    '<i class="fa fa-eye"></i>查看群成员' +
                    '</a>' +
                    '<a href="javascript:" id="room-info-add-member-btn" class="qn-btn show-manage-btn" data-mark="add-member">' +
                    '<i class="fa fa-plus"></i>添加群成员' +
                    '</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

  // 群信息价格信息
  $roomPriceInfo = $('<div class="qn-form-section">' +
                '<span class="qn-form-section-title">收费设置</span>' +
                '<div class="row">' +
                '<div class="col-xs-8"></div>' +
                '<div class="col-xs-4 text-right">' +
                '<a href="javascript:" id="room-info-edit-price" class="qn-btn primary">' +
                '<i class="fa fa-cog"></i>收费设置' +
                '</a>' +
                '</div>' +
                '</div>' +
                '</div>');

  // 群信息价格设置
  $roomPriceSettings = $('<div class="qn-form-section">' +
                  '<div class="row">' +
                  '<div class="col-xs-12">' +
                  '' +
                  '' +
                  '</div>' +
                  '</div>' +
                  '</div>');

  // 退出直播群按钮
  $logoutRoom = $('<div id="logout-live-room-box" class="qn-form-section">' +
            '<a href="javascript:" id="logout-live-room-btn" class="qn-btn danger"></a>' +
            '</div>');

  /*
   * 聊天的公共方法，供其他地方调用聊天
   * @createChatWindow: 创建聊天窗口
   */
  $.extend({
    /* 切换聊天窗口 */
    chooseChatWindow: function(data) {
      // 隐藏已打开的管理窗口
      $('#qn-pager-title').find('.qn-pager-return-window').each(function() {
        var $el = $(this),
            mark = $el.data('mark'),
            id = $el.data('id');

        SEMICOLON.manage.hiddenManageWindow(mark, id);
      });

      SEMICOLON.chat.chooseChatWindow(data);

      if(!$('#qn-pager-recent-box').find('.active').hasClass('.contacts-item-' + data.id)) {
        $('#qn-pager-recent-box').find('.contacts-item').removeClass('active');
      }
    },

    /* 打开编辑群信息窗口 */
    openEditWindow: function(data) {
      // 隐藏已打开的管理窗口
      if($('#qn-pager-title').find('.qn-pager-return-window').length) {
        var i = 0,
            t = $('#qn-pager-title').find('.qn-pager-return-window').length;

        $('#qn-pager-title').find('.qn-pager-return-window').each(function() {
          var $el = $(this),
              mark = $el.data('mark'),
              id = $el.data('id');

          i++;

          if(i === t) {
            var extend = {};

            extend['type'] = 'edit';
            extend['data'] = data;

            SEMICOLON.manage.hiddenManageWindow(mark, id, extend);
          } else {
            SEMICOLON.manage.hiddenManageWindow(mark, id);
          }
        });
      } else {
        SEMICOLON.manage.showManageWindow('room-info', data);
      }
    }
  });

  /* 将方法划分为不同模块进行编写 */
  var SEMICOLON = SEMICOLON || {};

  /*
   * 初始化
   * @init: 模块初始化方法
   * @windowSwitch: 聊天窗口显示与隐藏
   * @setEveryMinute: 记录每分钟的时间
   */
  SEMICOLON.initialize = {
    init: function() {
      SEMICOLON.initialize.windowSwitch();
      SEMICOLON.initialize.setEveryMinute();
    },

    /* 窗口切换 */
    windowSwitch: function() {
      // 打开聊天窗
      $(document).on('click', '#qn-pager-minimize', function() {
        $('#qn-pager-wrap').removeClass('hide');
        $('#qn-pager-minimize').addClass('hide');

        // 删除当前聊天窗口打点
        var delId;

        $('.qn-pager-chat-box').find('.qn-pager-chat-item').each(function() {
          if($(this).hasClass('active')) {
            delId = $(this).data('id');
          }
        });

        SEMICOLON.chat.deleteMsgBadge(delId);
      });

      // 关闭聊天窗
      $(document).on('click', '#close-qn-pager', function() {
        $('#qn-pager-minimize').removeClass('hide');
        $('#close-qn-pager').closest('#qn-pager-wrap').addClass('hide');
      });
    },

    /* 记录每分钟时间 */
    setEveryMinute: function() {
      var format = 'hh:mm';

      everyMinute = SEMICOLON.chat.getLocalTime(format);

      // 每分钟更新
      setInterval(function() {
        everyMinute = SEMICOLON.chat.getLocalTime(format);
      }, 60000);
    }
  };

  /*
   * 联系项
   * @init: 初始化方法
   * @groupSwitch: 切换分组
   * @fuzzyQuery: 模糊查询相关操作
   * @handleFuzzyQuery: 执行模糊查询
   * @queryLiveRoom: 查询直播群
   * @queryGroups: 查询分组
   * @queryContacts: 查询联系人列表
   * @incrLoadContacts: 增量加载联系人列表
   * @createGroup: 创建分组项
   * @createContacts: 创建联系项
   * @createRecentItem: 创建最近会话列表项
   * @appendRecentInfo: 追加最近会话的头像及名称
   * @getLiveRoomInfo: 获取直播群信息
   * @getUserInfo: 获取用户信息
   */
  SEMICOLON.contacts = {
    init: function() {
      SEMICOLON.contacts.groupSwitch();
      SEMICOLON.contacts.fuzzyQuery();
      SEMICOLON.contacts.queryLiveRoom();
      SEMICOLON.contacts.queryGroups();
    },

    /* 分组切换 */
    groupSwitch: function() {
      $(document).on('click', '.qn-pager-contacts-group > .group-title', function() {
        var $el = $(this),
            $thisWrap = $el.parent('.qn-pager-contacts-group'),
            $thisList = $el.next('.qn-pager-contacts-list'),
            type = $thisWrap.data('type'), // F: 好友分组; R: 直播群分组
            use = $thisWrap.data('use'); // 1: 普通联系人列表; 2: 邀请成员联系人列表

        if($thisWrap.hasClass('open')) {
          $el.find('.fa').removeClass('fa-caret-down').addClass('fa-caret-right');

          $thisList.slideUp(function() {
            $thisWrap.removeClass('open');
          });
        } else {
          // 类型为好友分组并且还没有加载任何的联系人
          if(type === 'F' && $thisWrap.data('been') === 0) {
            var groupId = $thisWrap.data('id'),
                groupCount = $thisWrap.data('count'),
                readVersion = $thisWrap.data('version'),
                limitNum = 50,
                queryData = {};

            queryData['readVersion'] = readVersion;
            queryData['limitNum'] = limitNum;

            if(groupId && groupCount > 0 && getContacts) {
              queryData['groupId'] = groupId;

              /* 初始化分组好友列表 */
              switch(use) {
                case 1:
                  SEMICOLON.contacts.queryContacts($thisWrap, queryData);
                  break;
                case 2:
                  queryData['imGroupId'] = $('#qn-pager-add-member-room-id').val();

                  SEMICOLON.contacts.queryContacts($thisWrap, queryData);
                  break;
              }
            } else if(!groupId && !groupCount && getContacts) {
              /* 初始化全部好友列表（小白） */
              switch(use) {
                case 1:
                  SEMICOLON.contacts.queryContacts($thisWrap, queryData);
                  break;
                case 2:
                  queryData['imGroupId'] = $('#qn-pager-add-member-room-id').val();

                  SEMICOLON.contacts.queryContacts($thisWrap, queryData);
                  break;
              }
            } else if(groupCount === 0) {
              /* 如果该分组内没有成员，则只执行小三角动画 */
              $el.find('.fa').removeClass('fa-caret-right').addClass('fa-caret-down');

              $thisWrap.addClass('open');
            }
          } else {
            $el.find('.fa').removeClass('fa-caret-right').addClass('fa-caret-down');

            $thisList.slideDown(function() {
              $thisWrap.addClass('open');
            });
          }
        }
      });
    },

    /* 模糊查询相关操作 */
    fuzzyQuery: function() {
      var $queryInput = $('.qn-pager-fuzzy-query-input');

      // 获取焦点样式
      $queryInput.focus(function() {
        $(this).closest('.qn-pager-fuzzy-query').addClass('active');
      });

      // 获取焦点样式
      $queryInput.blur(function() {
        $(this).closest('.qn-pager-fuzzy-query').removeClass('active');
      });

      // 模糊查询
      $queryInput.keyup(function() {
        var thisVal = $.trim($(this).val()),
            thisType = $(this).data('type');

        if(thisVal !== null && thisVal !== '') {
          if(fuzzyQueryGetResult) {
            var queryData = {};

            queryData['keyWords'] = thisVal;

            if(thisType === 2) {
              queryData['groupId'] = $('#qn-pager-add-member-room-id').val();
            }

            SEMICOLON.contacts.handleFuzzyQuery(queryData, thisType);
          }
        } else {
          switch(thisType) {
            case 1:
              $('.qn-tab-paper').find('.qn-pager-fuzzy-query-result').remove();
              break;
            case 2:
              $('.qn-pager-add-member-contacts-list').find('.qn-pager-fuzzy-query-result').remove();
              break;
          }
        }
      });

      // 点击任何地方关闭模糊查询结果
      $(document).on('click', function(event) {
        if(!$(event.target).closest('.qn-pager-fuzzy-query-identify').length) {
          $('.qn-pager-fuzzy-query-result').remove();
          $('.qn-pager-fuzzy-query-input').val('');
        }
      });
    },

    /*
     * 执行模糊查询
     * @queryData: 查询所需的参数，参数内容如下:
     * * @keyWords: 需要查询的关键字
     * * @groupId: 直播群群号，邀请新成员时用
     * @type: 哪里的模糊查询，1: 普通的联系人列表，2: 邀请新成员的好友列表
     */
    handleFuzzyQuery: function(queryData, type) {
      // 执行模糊查询
      var url = '/contacts/query',
          param = {},
          params = {};

      if(type === 2) {
        param['groupId'] = queryData.groupId;
      }

      param['keyWords'] = queryData.keyWords;
      params['params'] = param;

      fuzzyQueryGetResult = false; // 防止模糊查询重发

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        var $resultBox,
            contactsData = {};

        // 判断有没有搜索的结果集层
        if(type === 1) {
          /* 普通的模糊查询 */
          if(!$('.qn-tab-paper').find('.qn-pager-fuzzy-query-result').length) {
            /* 没有，创建一个列表 */
            $resultBox = $fuzzyQueryResult.clone();

            $('.qn-tab-paper').append($resultBox);
          } else {
            /* 有，清空当前列表 */
            $resultBox = $('.qn-tab-paper').find('.qn-pager-fuzzy-query-result');

            $resultBox.find('.qn-pager-contacts-list li').remove();
          }
        } else if(type === 2) {
          /* 邀请新成员的模糊查询 */
          if(!$('.qn-pager-add-member-contacts-list').find('.qn-pager-fuzzy-query-result').length) {
            /* 没有，创建一个列表 */
            $resultBox = $fuzzyQueryResult.clone();

            $('.qn-pager-add-member-contacts-list').append($resultBox);
          } else {
            /* 有，清空当前列表 */
            $resultBox = $('.qn-pager-add-member-contacts-list').find('.qn-pager-fuzzy-query-result');

            $resultBox.find('.qn-pager-contacts-list li').remove();
          }
        }

        if(data.code === 0) {
          /* 查询成功 */
          if(data.result !== undefined && data.result.datas.length > 0) {
            /* 结果集不为空 */
            var result = data.result.datas;

            $.each(result, function(i) {
              var $contactsClone,
                  item = result[i];

              contactsData['icon'] = $.checkUserIcon(item.uIcon);
              contactsData['name'] = item.uName;
              contactsData['type'] = 'Q';
              contactsData['imId'] = item.imId;
              contactsData['uId'] = item.uId;

              if(type === 2) {
                contactsData['inGroup'] = item.inGroup;
              }

              $contactsClone = SEMICOLON.contacts.createContacts(contactsData);

              $resultBox.find('.qn-pager-contacts-list').append($contactsClone);
            });
          } else {
            /* 结果集为空 */
            contactsData['type'] = 'N';

            var $noResult = SEMICOLON.contacts.createContacts(contactsData);

            $resultBox.find('.qn-pager-contacts-list').append($noResult);
          }
        } else {
          /* 查询失败 */
          contactsData['type'] = 'N';

          var $errorResult = SEMICOLON.contacts.createContacts(contactsData);

          $resultBox.find('.qn-pager-contacts-list').append($errorResult);
        }

        fuzzyQueryGetResult = true;
      }).fail(function(data) {
        /* 查询失败 */
        var $resultBox,
            $errorResult,
            contactsData = {};

        contactsData['type'] = 'N';

        $errorResult = SEMICOLON.contacts.createContacts(contactsData);

        // 判断有没有搜索的结果集层
        if(!$('.qn-tab-paper').find('.qn-pager-fuzzy-query-result').length) {
          $resultBox = $fuzzyQueryResult.clone();

          $('.qn-tab-paper').append($resultBox);
        } else {
          $resultBox = $('.qn-pager-fuzzy-query-result');

          $resultBox.find('.qn-pager-contacts-list li').remove();
        }

        $resultBox.find('.qn-pager-contacts-list').append($errorResult);

        fuzzyQueryGetResult = true;
      });
    },

    /* 查询直播群 */
    queryLiveRoom: function() {
      var url = '/live_room/rooms',
          params = {};

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        if(data.code === 0) {
          if(typeof data.result !== undefined && typeof data.result.add !== "undefined" && data.result.add.length > 0) {
            var $groupClone,
                rooms = data.result.add,
                count = rooms.length,
                titleContent = '直播群<i>(&nbsp;' + count + '&nbsp;)</i>',
                type = 'R',
                isOpen = 1;

            $groupClone = SEMICOLON.contacts.createGroup(type, titleContent, isOpen, 1, count);

            // 添加直播群项
            $.each(rooms, function(i) {
              var $contactsClone,
                  room = rooms[i],
                  contactsData = {};

              contactsData['icon'] = room.icon;
              contactsData['name'] = room.groupName;
              contactsData['type'] = 'R';
              contactsData['imId'] = room.groupId;
              contactsData['charge'] = room.isCharge;
              contactsData['owner'] = room.isOwner;
              contactsData['ownerImId'] = room.ownerId;

              $contactsClone = SEMICOLON.contacts.createContacts(contactsData);

              // 添加直播群项
              $groupClone.find('.qn-pager-contacts-list').append($contactsClone);
            });

            $groupClone.data('been', count);

            $('#qn-pager-contacts-box').prepend($groupClone);
          }
        }
      });
    },

    /* 查询分组 */
    queryGroups: function() {
      if(userType === 2) {
        /* 用户类型为投顾则加载分组 */
        var url = '/contacts/groups',
            param = {},
            params = {};

        param['groupType'] = 'F';

        params['params'] = param;

        $.ajax({
          type: 'POST',
          url: url,
          data: JSON.stringify(params),
          dataType: 'json',
          contentType: 'application/json'
        }).done(function(data) {
          if(data.code === 0) {
            if(data.result !== undefined && data.result.datas.length > 0) {
              var groups = data.result.datas;

              $.each(groups, function(i) {
                var $ordinaryGroup, // 普通联系人列表
                    $inviteGroup, // 邀请好友联系人列表
                    group = groups[i],
                    count = group.count,
                    name = group.name + '<i>(&nbsp;' + count + '&nbsp;)</i>',
                    type = group.groupType,
                    isOpen = 0,
                    id = group.groupId;

                $ordinaryGroup = SEMICOLON.contacts.createGroup(type, name, isOpen, 1, count, id);
                $inviteGroup = SEMICOLON.contacts.createGroup(type, name, isOpen, 2, count, id);

                $('#qn-pager-contacts-box').append($ordinaryGroup);
                $('.qn-pager-add-member-contacts-list').append($inviteGroup);
              });
            }
          }
        });
      } else if(userType === 1) {
        /* 用户类型为小白则直接显示全部好友分组 */
        var $groupClone,
            name = '全部好友',
            type = 'F',
            isOpen = 0;

        $groupClone = SEMICOLON.contacts.createGroup(type, name, isOpen, 1);

        $('#qn-pager-contacts-box').append($groupClone);
      }
    },

    /*
     * 查询联系人列表
     * @groupBox: 分组的盒子模型
     * @queryData: 查询所需的参数，参数内容如下:
     * * @readVersion: 读取版本号, 分页用
     * * @limitNum: 每次拉取的条数
     * * @groupId: 分组id
     * * @imGroupId: 直播群id, 管理群成员时用, 判断该好友是否在群内
     */
    queryContacts: function(groupBox, queryData) {
      var $groupBox = groupBox,
          readVersion = queryData.readVersion,
          limitNum = queryData.limitNum,
          groupId = queryData.groupId,
          imGroupId = queryData.imGroupId,
          url = '/contacts/contacts',
          param = {},
          params = {};

      getContacts = false; // 防止下拉增量联系人时的重发

      param['readVersion'] = readVersion !== undefined ? readVersion : 0;
      param['limitNum'] = limitNum !== undefined ? limitNum : 50;

      if(groupId) {
        param['groupId'] = groupId;
      }

      if(imGroupId) {
        param['imGroupId'] = imGroupId;
      }

      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        var been = $groupBox.data('been'); // 已经加载的人数

        if(data.code === 0) {
          if(data.result !== undefined && data.result.datas.length > 0) {
            var result = data.result.datas;

            // 如果有重试项则删除
            if($groupBox.find('li.error').length) {
              $groupBox.find('li.error').remove();
            }

            // 设置下次请求的版本号
            $groupBox.data('version', data.result.readVersion);

            // 记录该分组下已加载了多少个联系人
            $groupBox.data('been', (been + result.length));

            // 循环加入联系人
            $.each(result, function(i) {
              var $contactsClone,
                  item = result[i],
                  contactsData = {};

              contactsData['icon'] = $.checkUserIcon(item.uIcon, item.gender);
              contactsData['name'] = item.uName;
              contactsData['type'] = 'F';
              contactsData['imId'] = item.imId;
              contactsData['uId'] = item.uId;

              if(imGroupId) {
                contactsData['inGroup'] = item.inGroup;
              }

              $contactsClone = SEMICOLON.contacts.createContacts(contactsData);

              $groupBox.find('.qn-pager-contacts-list').append($contactsClone);
            });
          }
        } else {
          var contactsData = {},
              $errorClone;

          contactsData['type'] = 'E';

          $errorClone = SEMICOLON.contacts.createContacts(contactsData);

          $errorClone.find('a').bind('click', function() {
            SEMICOLON.contacts.queryContacts(groupBox, queryData);
          });

          $groupBox.find('.qn-pager-contacts-list').append($errorClone);
        }

        // 如果是初次加载分组内用户，则打开该分组
        if(been === 0) {
          $groupBox.find('.group-title .fa').removeClass('fa-caret-right').addClass('fa-caret-down');

          $groupBox.find('.qn-pager-contacts-list').slideDown(function() {
            $groupBox.addClass('open');
          });
        }

        getContacts = true;
      }).fail(function(data) {
        var been = $groupBox.data('been'),
            contactsData = {},
            $errorClone;

        contactsData['type'] = 'E';

        $errorClone = SEMICOLON.contacts.createContacts(contactsData);

        $errorClone.find('a').bind('click', function() {
          SEMICOLON.contacts.queryContacts(groupBox, queryData);
        });

        $groupBox.find('.qn-pager-contacts-list').append($errorClone);

        // 如果是初次加载分组内用户，则打开该分组
        if(been === 0) {
          $groupBox.find('.group-title .fa').removeClass('fa-caret-right').addClass('fa-caret-down');

          $groupBox.find('.qn-pager-contacts-list').slideDown(function() {
            $groupBox.addClass('open');
          });
        }

        getContacts = true;
      });
    },

    /* 增量加载联系人 */
    incrLoadContacts: function(e) {
      if(e.scrollTop > scrollTop) {
        $(e).find('.qn-pager-contacts-group').each(function() {
          var $item = $(this);

          if($item.hasClass('open')) {
            var pTop = $item.position().top,
                thisHeight = $item.outerHeight();

            // 如果该分组已滚动到最底部
            if((thisHeight + pTop) <= $(e).height()) {
              // 如果该分组为好友分组，并且上次的请求已经完成
              if($item.data('type') === 'F' && getContacts) {
                var queryData = {};

                queryData['readVersion'] = $item.data('version');
                queryData['limitNum'] = 50;
                queryData['groupId'] = $item.data('id');

                if($item.data('use') === 2) {
                  queryData['imGroupId'] = $('#qn-pager-add-member-room-id').val();
                }

                if(userType === 2) {
                  /* 如果是投顾必须比较后才执行 */
                  var count = $item.data('count'), // 分组内的总人数
                      been = $item.data('been'); // 已加载完的人数

                  if(count > been) {
                    SEMICOLON.contacts.queryContacts($item, queryData);
                  }
                } else {
                  SEMICOLON.contacts.queryContacts($item, queryData);
                }
              }
            }
          }
        });
      } else {
        scrollTop = 0;
      }

      scrollTop = e.scrollTop;
    },

    /*
     * 创建分组项
     * @type: 分组类型
     * @name: 分组名称
     * @open: 是否为打开状态, 0: 不打开, 1: 打开
     * @use: 用在哪里, 1: 普通联系人列表, 2: 邀请新成员联系人列表
     * ---------- 以下为直播群与好友分组才有的属性 ----------
     * @count: 该分组下项的总数
     * ---------- 以下为好友分组才有的属性 ----------
     * @id: 分组ID
     */
    createGroup: function(type, name, open, use, count, id) {
      var $groupClone = $groupItem.clone(),
          $thisTitle = $groupClone.children('.group-title');

      $thisTitle.append(name);
      $groupClone.data('type', type);
      $groupClone.data('use', use);
      $groupClone.data('version', 0); // 增量拉取版本号
      $groupClone.data('been', 0); // 分组下已加载项的数量

      if(count) {
        $groupClone.data('count', count);
      }

      if(id) {
        $groupClone.data('id', id);
      }

      if(open === 1) {
        $thisTitle.find('.fa').removeClass('fa-caret-right').addClass('fa-caret-down');
        $groupClone.addClass('open');
      }

      return $groupClone;
    },

    /*
     * 创建联系项
     * @data: 创建联系人列表项所需参数，参数内容如下:
     * * ========== 以下为显示参数 ==========
     * * @icon: 图标
     * * @name: 名称
     * * ========== 以下为切换窗口所需参数 ==========
     * * @type: 类型, F: 好友, R: 直播群, Q: 模糊查询, E: 错误, N: 空的
     * * @imId: 环信ID
     * * @uId: 用户ID
     * * ---------- 以下为直播群项才有的属性 ----------
     * * @charge: 是否收费, N: 不收, Y: 收
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @ownerImId: 群主的环信号
     * * ========== 以下为邀请新成员所需的参数 ==========
     * * @inGroup: 是否在该直播群中, 0: 不在, 1: 在
     */
    createContacts: function(data) {
      var $contactsClone = $contactsItem.clone(),
          type = data.type,
          icon = data.icon,
          name = data.name,
          imId = data.imId,
          uId = data.uId,
          charge = data.charge,
          owner = data.owner,
          ownerImId = data.ownerImId,
          inGroup = data.inGroup;

      if(type !== 'E' && type !== 'N') {
        $contactsClone.addClass('contacts-item-' + imId);

        switch(type) {
          case 'Q':
            $contactsClone.addClass('contacts-item-query');
            break;
          case 'R':
            $contactsClone.data('charge', charge);
            $contactsClone.data('owner', owner);
            $contactsClone.data('owner_imid', ownerImId);
            break;
        }

        $contactsClone.find('.qn-avatar img').attr('src', icon);
        $contactsClone.find('.contacts-title').html(name);
        $contactsClone.data('imid', imId);
        $contactsClone.data('uid', uId);
        $contactsClone.data('type', type);

        if(inGroup !== undefined) {
          $contactsClone.addClass('add-member');

          switch(inGroup) {
            case 0:
              $contactsClone.find('a').append('<i class="fa fa-plus"></i>');
              break;
            case 1:
              $contactsClone.addClass('in-group');

              $contactsClone.find('a').append('<i class="fa fa-check"></i>');
              break;
          }

          if(addMemberArray.indexOf(uId) >= 0) {
            $contactsClone.addClass('selected-member');

            $contactsClone.find('a').find('.fa').removeClass('fa-plus').addClass('fa-check');
          }
        }
      } else {
        $contactsClone.addClass('error');

        switch(type) {
          case 'E':
            var errorContent = '加载失败，<a href="javascript:">点击重试</a>';

            $contactsClone.html(errorContent);
            break;
          case 'N':
            $contactsClone.html('没有结果');
            break;
        }
      }

      return $contactsClone;
    },

    /*
     * 创建最近会话列表项
     * @data: 创建最近会话列表项所需参数，参数内容如下:
     * * ========== 以下为显示参数 ==========
     * * @content: 显示的内容
     * * @time: 消息时间
     * * ========== 以下为创建最近会话项所需参数 ==========
     * * @type: 聊天的类型, F: 好友, R: 直播群
     * * @imid: 联系项Id
     * * ---------- 以下为直播群项才有的属性 ----------
     * * @charge: 是否收费, N: 不收, Y: 收
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @owner_imid: 群主的环信ID
     */
    createRecentItem: function(data) {
      var $recentClone = $recentItem.clone(),
          id = 'recent-itemt-' + $.onlyNum(), // 生成一个唯一数，作为最近会话项的ID
          icon,
          name,
          type = data.type,
          imid = data.imid,
          message = $.limitText(data.content, 7),
          badge = '',
          $findRecent = $('#qn-pager-recent-box').find('.contacts-item-' + imid),
          $findContects = $('#qn-pager-contacts-box').find('.contacts-item-' + imid);

      $recentClone.addClass('contacts-item-' + imid);
      $recentClone.attr('id', id); // 该ID用来异步追加头像

      // 如果是当前窗口，则加上选择状态
      if($('.qn-pager-chat-box').find('.qn-pager-chat-item-' + imid).length && $('.qn-pager-chat-box').find('.qn-pager-chat-item-' + imid).hasClass('active')) {
        $('#qn-pager-recent-box').find('.contacts-item').removeClass('active');
        $recentClone.addClass('active');
      }

      if($findRecent.length) {
        /* 如果最近会话列表中有该项，则获取头像及名称 */
        icon = $findRecent.find('.qn-avatar img').attr('src');
        name = $findRecent.find('.contacts-title').html();

        // 如果有消息打点
        if($findRecent.find('.qn-badge').length) {
          badge = $badgeHtml.clone();

          badge.data('num', $findRecent.find('.qn-badge').data('num'));
          badge.html($findRecent.find('.qn-badge').data('num'));
        }
      } else if($findContects.length) {
         /* 如果联系人列表中有该项，则获取头像及名称 */
        icon = $findContects.find('.qn-avatar img').attr('src');
        name = $findContects.find('.contacts-title').html();
      }

      // 设置属性
      $recentClone.data('imid', imid);
      $recentClone.data('type', type);

      switch(type) {
        case 'R':
          $recentClone.data('charge', data.charge);
          $recentClone.data('owner', data.owner);
          $recentClone.data('owner_imid', data.owner_imid);
          break;
      }

      // 设置显示内容
      $recentClone.find('.qn-avatar img').attr('src', icon);
      $recentClone.find('.contacts-title').html(name);
      $recentClone.find('.contacts-content').html(message);
      $recentClone.find('.contacts-time').html(data.time);
      $recentClone.find('a').append(badge);

      // 追加最近会话项
      $('#qn-pager-recent-box').find('.contacts-item-' + imid).remove();
      $('#qn-pager-recent-box').find('.qn-pager-contacts-list').prepend($recentClone);

      // 如果没有头像名称，则追加
      if(icon === undefined && name === undefined) {
        SEMICOLON.contacts.appendRecentInfo(type, imid, id);
      }
    },

    /*
     * 追加最近会话的头像及名称
     * @type: 需要查询的类型，R: 直播群，F: 联系人
     * @id: 查询用的id
     * @toId: 需追加的容器ID
     */
    appendRecentInfo: function(type, id, toId) {
      var url,
          param = {},
          params = {},
          $belong = $('#qn-pager-recent-box').find('#' + toId),
          icon = $.checkUserIcon(),
          name = '未命名';

      switch(type) {
        case 'R':
          url = '/live_room/read';

          param['groupId'] = id;
          params['params'] = param;

          $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json'
          }).done(function(data) {
            if(data.code === 0) {
              /* 创建直播群聊天窗口 */
              var result = data.result.data;

              icon = result.icon;
              name = result.groupName;
            }

            $belong.find('.qn-avatar img').attr('src', icon);
            $belong.find('.contacts-title').html(name);
          }).fail(function(data) {
            $belong.find('.qn-avatar img').attr('src', icon);
            $belong.find('.contacts-title').html(name);
          });

          break;
        case 'F':
          url = '/contacts/user_info';

          param['imIds'] = [id];
          params['params'] = param;

          $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json'
          }).done(function(data) {
            if(data.code === 0) {
              if(data.result !== undefined && data.result.data.length > 0) {
                var infoData = data.result.data;

                $.each(infoData, function(i) {
                  var infoItem = infoData[i];

                  icon = infoItem.userIcon;
                  name = infoItem.nickname;
                });
              }
            }

            $belong.find('.qn-avatar img').attr('src', icon);
            $belong.find('.contacts-title').html(name);
          }).fail(function(data) {
            $belong.find('.qn-avatar img').attr('src', icon);
            $belong.find('.contacts-title').html(name);
          });

          break;
      }
    },

    /*
     * 获取直播群信息
     * @id: 直播群ID
     * @useType: 使用类型，1: 查看群信息, 2: 用于创建直播群窗口
     */
    getLiveRoomInfo: function(id, useType) {
      var url = '/live_room/read',
          param = {},
          params = {};

      param['groupId'] = id;
      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        if(data.code === 0) {
          if(userType === 1) {
            /* 查询直播群信息 */
          } else if(userType === 2) {
            /* 创建直播群聊天窗口 */
            var result = data.result.data,
                owner,
                ownerImId = result.ownerId,
                createChatData = {};

            owner = ownerImId === curUserId ? 1 : 0;

            // 创建聊天窗口所需参数
            createChatData['type'] = 'R';
            createChatData['name'] = result.groupName;
            createChatData['id'] = result.groupId;
            createChatData['charge'] = result.isCharge;
            createChatData['owner'] = owner;
            createChatData['ownerImId'] = ownerImId;

            SEMICOLON.chat.createChatWindow(createChatData);
          }
        } else {
          if(userType === 1) {
            console.log('失败');
          }
        }
      }).fail(function(data) {
        if(useType === 1) {
          console.log('失败');
        }
      });
    },

    /*
     * 获取用户信息
     * @id: 用户的环信ID
     */
    getUserInfo: function(id) {
      var url = '/contacts/user_info',
          param = {},
          params = {};

      param['imIds'] = [id];
      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        if(data.code === 0) {
          console.log('拉取用户信息成功');
        } else {
          console.log('拉取用户信息失败');
        }
      }).fail(function(data) {
        console.log('拉取用户信息失败');
      });
    }
  };

  /*
   * 环信相关
   * @init: 模块初始化
   * @initEasemob: 初始化环信
   * @loginEasemob: 登录环信
   * @logoutEasemob: 注销环信
   * @handleConfig: 配置文件处理方法
   * @handleOpen: 连接成功后的处理方法
   * @handleClosed: 连接关闭后的处理方法
   * @handleError: 异常时的处理方法
   * @handleTextMessage: 文本消息的处理方法
   * @handleCmdMessage: 透传消息的处理方法
   * @handlePictureMessage: 图片消息的处理方法
   * @sendText: 发送文本信息
   * @sendPicture: 发送图片信息
   */
  SEMICOLON.easemob = {
    init: function() {
      SEMICOLON.easemob.handleConfig();
      SEMICOLON.easemob.initEasemob();
      SEMICOLON.easemob.loginEasemob();
      SEMICOLON.easemob.logoutEasemob();
    },

    /* 初始化环信 */
    initEasemob: function() {
      easemobConn = new Easemob.im.Connection();

      easemobConn.init({
        https: Easemob.im.config.https,
        url: Easemob.im.config.xmppURL,
        // 当连接成功时的回调方法
        onOpened: function() {
          SEMICOLON.easemob.handleOpen(easemobConn);
        },
        // 当连接关闭时的回调方法
        onClosed: function() {
          SEMICOLON.easemob.handleClosed();
        },
        // 收到文本消息时的回调方法
        onTextMessage: function(message) {
          SEMICOLON.easemob.handleTextMessage(message);
        },
        // 收到透传消息时的回调方法
        onCmdMessage: function(message) {
          SEMICOLON.easemob.handleCmdMessage(message);
        },
        // 收到图片消息时的回调方法
        onPictureMessage: function(message) {
          SEMICOLON.easemob.handlePictureMessage(message);
        },
        // 异常时的回调方法
        onError: function(message) {
          SEMICOLON.easemob.handleError(message);
        }
      });
    },

    /* 登录环信 */
    loginEasemob: function() {
      easemobConn.open({
        apiUrl: Easemob.im.config.apiURL,
        user: imId,
        pwd: imToken,
        appKey: Easemob.im.config.appkey
      });
    },

    /* 注销环信 */
    logoutEasemob: function() {
      $('.logout-easemob').click(function() {
        // 注销环信登录
        easemobConn.stopHeartBeat(easemobConn); // 停止心跳
        easemobConn.close(); // 关闭连接
      });
    },

    /* 配置文件处理方法 */
    handleConfig: function() {
      if(Easemob.im.Helper.getIEVersion() < 10) {
        Easemob.im.config.https = location.protocol === 'https:' ? true : false;

        if(!Easemob.im.config.https) {
          if(Easemob.im.config.xmppURL.indexOf('https') === 0) {
            Easemob.im.config.xmppURL = Easemob.im.config.xmppURL.replace(/^https/, 'http');
          }

          if(Easemob.im.config.apiURL.indexOf('https') === 0) {
            Easemob.im.config.apiURL = Easemob.im.config.apiURL.replace(/^https/, 'http');
          }
        } else {
          if(Easemob.im.config.xmppURL.indexOf('https') !== 0) {
            Easemob.im.config.xmppURL = Easemob.im.config.xmppURL.replace(/^http/, 'https');
          }

          if(Easemob.im.config.apiURL.indexOf('https') !== 0) {
            Easemob.im.config.apiURL = Easemob.im.config.apiURL.replace(/^http/, 'https');
          }
        }
      }
    },

    /* 连接成功后的处理方法 */
    handleOpen: function(easemobConn) {
      // 设置当前登录的环信用户
      curUserId = easemobConn.context.userId;

      // 设置用户上线，这个不写直接导致收不到信息
      easemobConn.setPresence();

      // 启动心跳
      if(easemobConn.isOpened()) {
        easemobConn.heartBeat(easemobConn);
      }
    },

    /* 连接关闭后的处理方法 */
    handleClosed: function() {
      // 注销齐牛登录
      window.location.href = '/zhuxiao';
    },

    /* 异常时的处理方法 */
    handleError: function(message) {
      console.log('环信出现异常了');
      console.log(message);

      // 停止心跳
      easemobConn.stopHeartBeat(easemobConn);
    },

    /* 文本消息的处理方法 */
    handleTextMessage: function(message) {
      SEMICOLON.chat.appendMsg(message);
    },

    /* 透传信息的处理方法 */
    handleCmdMessage: function(message) {
      // console.log('收到透传信息了');
      // console.log(message);

      if(message.action === 'groupInviteMsg') {
        /* 成员邀请 */
      } else if(message.action === 'joinGroupMsg') {
        /* 用户自动加群 */
      } else if(message.action === 'announcement') {
        /* 群公告更新 */
      }
    },

    /* 图片信息的处理方法 */
    handlePictureMessage: function(message) {
      var options = message,
          filename = message.filename,
          messageData = {};

      messageData['from'] = message.from;
      messageData['to'] = message.to;
      messageData['id'] = message.id;
      messageData['type'] = message.type;
      messageData['ext'] = message.ext;

      // 图片消息下载成功后的处理逻辑
      options.onFileDownloadComplete = function(response, xhr) {
        var objectURL = Easemob.im.Helper.parseDownloadResponse.call(this, response),
          img = document.createElement('img');

        img.onload = function(e) {
          img.onload = null;
          // -start
          // jshint报错 2016.3.16 qiulijun修改
          // 以下是原代码
          // window.URL && window.URL.revokeObjectURL && window.URL.revokeObjectURL(img.src);
          if( window.URL && window.URL.revokeObjectURL ) {
            window.URL.revokeObjectURL(img.src);
          }
          // -end
        };

        img.onerror = function() {
          img.onerror = null;

          // 判断浏览器是否支持FileReader接口
          if(typeof FileReader === 'undefined') {
            img.alter = '当前浏览器不支持blob方式';

            return;
          }

          img.onerror = function() {
            img.alter = '当前浏览器不支持blob方式';
          };

          var reader = new FileReader();

          reader.onload = function(event) {
            img.src = this.result;
          };

          reader.readAsDataURL(response);
        };

        img.src = objectURL;

        var picRealWidth = options.width;

        if(!picRealWidth || picRealWidth === 0) {
          $('<img/>').attr('src', objectURL).load(function() {
            picRealWidth = this.width;

            if(picRealWidth > msgImgMaxWidth) {
              img.width = msgImgMaxWidth;
            } else {
              img.width = picRealWidth;
            }

            messageData['data'] = {
              data: [{
                type : 'pic',
                filename : filename || '',
                data : img
              }]
            };

            SEMICOLON.chat.appendMsg(messageData);
          });
        } else {
          if(picRealWidth > msgImgMaxWidth) {
            img.width = msgImgMaxWidth;
          } else {
            img.width = picRealWidth;
          }

          messageData['data'] = {
            data: [{
              type: 'pic',
              filename: filename || '',
              data: img
            }]
          };

          SEMICOLON.chat.appendMsg(messageData);
        }
      };

      var redownLoadFileNum = 0;

      options.onFileDownloadError = function(e) {
        //下载失败时只重新下载一次
        if(redownLoadFileNum < 1) {
          redownLoadFileNum++;
          options.accessToken = message.accessToken;
          Easemob.im.Helper.download(options);
        } else {
          messageData['data'] = e.msg + ',下载图片' + filename + '失败';

          SEMICOLON.chat.appendMsg(messageData);
          redownLoadFileNum = 0;
        }
      };

      // easemobwebim-sdk包装的下载文件对象的统一处理方法。
      Easemob.im.Helper.download(options);
    },

    /* 发送文本消息 */
    sendText: function() {
      var $curChatWindow = $('.qn-pager-chat-box').find('.active'),
          $curInput = $curChatWindow.find('.chat-msg-input'),
          $curSubmitBtn = $curChatWindow.find('.chat-msg-submit-btn'),
          val = $curInput.val(),
          qnUserId = $('#header-user-avatar-box').data('id'),
          qnNickName = $('#header-user-avatar-box').data('nickname'),
          qnMsgType = 0,
          ext = {},
          options = {},
          showVal = $.filterScriptLabel(val), // 显示的文本消息
          localTime = SEMICOLON.chat.getLocalTime('hh:mm'); // 本地时间

      // 如果当前为输入状态，则返回
      if(textSending) {
        return;
      }

      textSending = true;

      // 如果当前聊天对象为空，则返回
      if(curChatId === null) {
        return;
      }

      // Nickname转string
      if(!isNaN(qnNickName)) {
        qnNickName = qnNickName.toString();
      }

      // 扩展信息属性
      ext['qnUserId'] = qnUserId;
      ext['qnNickName'] = qnNickName;
      ext['qnMsgType'] = parseInt(qnMsgType);

      // 文本信息属性
      options['to'] = curChatId.toString();
      options['msg'] = val;
      options['ext'] = ext;
      options['type'] = curChatType;

      // 调用环信的发送接口
      easemobConn.sendTextMessage(options);

      options['from'] = curUserId;
      options['data'] = showVal.replace(/\n/g, '<br>');

      SEMICOLON.chat.appendMsg(options);

      // 清空发送文本框
      $curInput.val('');
      $curSubmitBtn.addClass('disabled');

      setTimeout(function() {
        textSending = false;
      }, 1000);
    },

    /* 发送图片信息 */
    sendPicture: function() {

    }
  };

  /*
   * 聊天相关
   * @init: 模块初始化
   * @getLocalTime: 获取本地时间
   * @handleContactItem: 操作联系人项，点击打开聊天窗口
   * @chooseChatWindow: 切换聊天窗口
   * @showChatWindow: 打开聊天窗口
   * @hiddenChatWindow: 隐藏聊天窗口
   * @createChatWindow: 创建聊天窗口
   * @handleChatMore: 操作获取更多消息记录按钮
   * @getHistoryMsg: 获取历史消息
   * @submitTextMsg: 文本消息发送及发送按钮控制
   * @appendMsg: 消息显示的统一处理方法
   * @appendMsgTime: 追加消息时间
   * @appendMsgIcon: 追加消息头像（写在这里因为防止消息太多卡死，所以异步来搞）
   * @createImgMsg: 创建图片消息显示
   * @createCustomMsg: 创建自定义消息显示
   * @createRewardMsg: 创建红包消息显示
   * @openCustomMsg: 打开自定义消息
   * @handleRewardMsg: 打开红包消息
   * @chatScrollToBottom: 聊天窗口滚动条置底
   * @appendMsgBadge: 追加消息打点
   * @deleteMsgBadge: 删除消息打点
   */
  SEMICOLON.chat = {
    init: function() {
      // SEMICOLON.chat.chooseEmotionDialog();
      SEMICOLON.chat.handleContactItem();
      SEMICOLON.chat.handleChatMore();
      SEMICOLON.chat.submitTextMsg();
      SEMICOLON.chat.openCustomMsg();
      SEMICOLON.chat.handleRewardMsg();
    },

    /* 切换聊天表情按钮 */
    chooseEmotionDialog: function() {
      $(document).on('click', '.show-emotion-icon', function() {
        var $e = $(this);

        if($e.siblings('.chat-msg-input-toolbar-box').hasClass('hide')) {
          SEMICOLON.chat.showEmotionDialog($e.siblings('.chat-msg-input-toolbar-box'));
        } else {
          $e.siblings('.chat-msg-input-toolbar-box').addClass('hide');
        }
      });
    },

    /*
     * 打开聊天表情窗口
     */
    showEmotionDialog: function($el) {
      $el.removeClass('hide');

      if($el.find('.chat-emotion-ul li').length === 0) {
        var sjson = Easemob.im.Helper.EmotionPicData;

        // -start
        // jshint报错 @qiulijun
        // 代码待优化 -fixed
        for(var key in sjson) {
          var emotions = $('<img>').attr({
            'id' : key,
            'src' : sjson[key],
            'style' : 'cursor: pointer;'
          }).click(function() {
            SEMICOLON.chat.selectEmotionImg(this);
          });

          $('<li>').append(emotions).appendTo($el.find('.chat-emotion-ul'));
        }
        // -end
      }
    },

    /* 选择聊天表情 */
    selectEmotionImg: function(selImg) {
      var $txt = $(selImg).closest('.qn-pager-chat-item').find('.chat-msg-input');

      $txt.val($txt.val() + selImg.id);
      $txt.focus();
    },

    /*
     * 获取本地当前时间
     * @format: 时间格式
     */
    getLocalTime: function(format) {
      var date = new Date(),
          time = $.formatDate(date, format);

      return time;
    },

    /* 操作联系项，点击打开聊天窗口 */
    handleContactItem: function() {
      $(document).on('click', '.contacts-item', function() {
        var $el = $(this),
            id = $el.data('imid'),
            type = $el.data('type'),
            createChatData = {};

        if(!$el.hasClass('add-member')) {
          if(type === 'E' || type === 'N' || type === undefined) {
            return false;
          }

          // 创建聊天窗口所需参数
          createChatData['type'] = type;
          createChatData['name'] = $el.find('.contacts-title').html();
          createChatData['id'] = id;
          createChatData['charge'] = $el.data('charge');
          createChatData['owner'] = $el.data('owner');
          createChatData['ownerImId'] = $el.data('owner_imid');

          SEMICOLON.chat.chooseChatWindow(createChatData);

          // 最近会话列表中的对应项
          var $thisRecentItem = $('#qn-pager-recent-box').find('.contacts-item-' + id);

          // 如果是最近会话列表中的项
          if($el.closest('#qn-pager-recent-box').length) {
            $el.siblings('.contacts-item').removeClass('active');
            $el.addClass('active');

            // 如果是打了点的，则删除打点
            if($el.find('.qn-badge').length) {
              SEMICOLON.chat.deleteMsgBadge(id);
            }
          } else {
            // 如果对应的最近会话中有该项，则加选中状态
            if($thisRecentItem.length) {
              $('#qn-pager-recent-box').find('.contacts-item').removeClass('active');
              $thisRecentItem.addClass('active');

              // 如果对应的最近会话中有打点，则删除
              if($thisRecentItem.find('.qn-badge').length) {
                SEMICOLON.chat.deleteMsgBadge(id);
              }
            } else {
              $('#qn-pager-recent-box').find('.contacts-item').removeClass('active');
            }
          }

          // 如果是模糊查询项
          if($el.hasClass('contacts-item-query')) {
            // 如果最近会话列表中有该联系项，上选中状态
            if($thisRecentItem.length) {
              $('#qn-pager-recent-box').find('.contacts-item').removeClass('active');
              $thisRecentItem.addClass('active');

              // 如果该项还有打点
              if($thisRecentItem.find('.qn-badge').length) {
                SEMICOLON.chat.deleteMsgBadge(id);
              }
            } else {
              $('#qn-pager-recent-box').find('.contacts-item').removeClass('active');
            }

            // 清空查询结果
            $('.qn-pager-fuzzy-query-result').remove();
            $('.qn-pager-fuzzy-query-input').val('');
          }
        }
      });
    },

    /*
     * 切换聊天窗口
     * @data: 创建窗口所需参数
     */
    chooseChatWindow: function(data) {
      var type = data.type,
          id = data.id;

      // 当天聊天类型
      switch(type) {
        case 'R':
          curChatType = 'groupchat';
          break;
        case 'F':
          curChatType = 'chat';
          break;
        case 'Q':
          curChatType = 'chat';
          break;
        default:
          curChatType = 'chat';
      }

      if(id !== curChatId) {
        SEMICOLON.chat.showChatWindow(id, data);

        curChatId = id;
      }
    },

    /*
     * 打开聊天窗口
     * @id: 窗口ID
     * @createChatData: 创建窗口所需参数
     */
    showChatWindow: function(id, createChatData) {
      SEMICOLON.chat.hiddenChatWindow();

      if(!$('.qn-pager-chat-box').find('.qn-pager-chat-item-' + id).length) {
        SEMICOLON.chat.createChatWindow(createChatData);
      }

      $('.qn-pager-chat-box').find('.qn-pager-chat-item-' + id).addClass('active');

      // 滚动条置底
      SEMICOLON.chat.chatScrollToBottom($('.qn-pager-chat-box').find('.qn-pager-chat-item-' + id));
    },

    /*
     * 隐藏聊天窗口
     * @id: 窗口ID
     */
    hiddenChatWindow: function(id) {
      $('.qn-pager-chat-box').find('.qn-pager-chat-item').removeClass('active');
    },

    /*
     * 创建聊天窗口
     * @createChatData: 创建窗口所需参数，参数内容如下:
     * * @type: 聊天的类型，F:好友，R:直播群
     * * @name: 聊天对象名称
     * * @id: 聊天对象ID
     * * ---------- 以下为直播群类型才会用到 ----------
     * * @charge: 是否收费, N: 不收, Y: 收
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @ownerImId: 群主环信ID
     */
    createChatWindow: function(createChatData) {
      var $chatWindowClone = $chatWindow.clone(),
          info = createChatData,
          getHistoryData = {}; // 拉取历史消息对象

      // 设置窗口属性
      $chatWindowClone.find('.chat-title').html(info.name);

      // 如果是群，则加入群操作图标
      if(info.type === 'R') {
        // 添加收费标记
        if(info.charge === 'Y') {
          $chatWindowClone.find('.chat-title').append('<i>收费</i>');
        }

        // 设置拉取消息记录按钮
        $chatWindowClone.find('.btn-chat-more').data('type', 'G');

        getHistoryData['chatType'] = 'G';

        // 设置操作按钮
        var $roomOperate;

        switch(info.owner) {
          case 1:
            // 群主视角
            $roomOperate = $chatWindowOwnRoomOperate.clone();
            break;
          default:
            // 非群主视角
            $roomOperate = $chatWindowRoomOperate.clone();
        }

        $roomOperate.find('.show-manage-btn').data('id', info.id);
        $roomOperate.find('.show-manage-btn').data('owner', info.owner);
        $roomOperate.find('.show-manage-btn').data('charge', info.charge);

        $chatWindowClone.find('.chat-header').append($roomOperate);
      } else {
        // 设置拉取消息记录按钮
        $chatWindowClone.find('.btn-chat-more').data('type', 'C');

        getHistoryData['chatType'] = 'C';
      }

      // 设置拉取消息记录按钮
      $chatWindowClone.find('.btn-chat-more').data('id', info.id);

      getHistoryData['imId'] = info.id;

      // 设置窗口属性
      $chatWindowClone.data('id', info.id);
      $chatWindowClone.data('charge', info.charge);
      $chatWindowClone.data('owner', info.owner);
      $chatWindowClone.data('owner_imid', info.ownerImId);

      // 添加窗口
      $chatWindowClone.addClass('qn-pager-chat-item-' + info.id);
      $('.qn-pager-chat-box').append($chatWindowClone);

      // 初始化历史消息
      SEMICOLON.chat.getHistoryMsg(info.id, getHistoryData);
    },

    /* 操作获取更多消息记录按钮 */
    handleChatMore: function() {
      $(document).on('click', '.btn-chat-more', function() {
        var $el = $(this),
            type = $el.data('type'),
            id = $el.data('id'),
            msgId = $el.data('msg_id'),
            getHistoryData = {};

        if(!$el.hasClass('disable')) {
          getHistoryData['chatType'] = type;
          getHistoryData['imId'] = id;
          getHistoryData['msgId'] = msgId;

          SEMICOLON.chat.getHistoryMsg(id, getHistoryData);
        }
      });
    },

    /*
     * 获取历史消息
     * @winId: 聊天窗口ID
     * @data: 拉取历史消息所需参数，参数内容如下
     * * @chatType: 聊天的类型，G: 群聊，C: 单聊
     * * @imId: 环信ID
     * * ---------- 以下可不定义 ----------
     * * @msgId: 分页用，从哪条消息开始拉，为空就拉最新
     * * @count: 拉取的条数
     */
    getHistoryMsg: function(winId, data) {
      // 执行模糊查询
      var $thisWin = $('.qn-pager-chat-box').find('.qn-pager-chat-item-' + winId),
          $thisBtn = $thisWin.find('.btn-chat-more'),
          url = '/im/fetch_chat_history',
          param = {},
          params = {};

      param['chatType'] = data.chatType;
      param['imId'] = data.imId;

      if(data.msgId) {
        param['msgId'] = data.msgId;
      }

      if(data.count) {
        param['count'] = data.count;
      } else {
        param['count'] = 15;
      }

      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
          $thisBtn.html('正在拉取消息记录…');
        }
      }).done(function(data) {
        if(data.code === 0) {
          var result = data.result;

          if(result !== undefined && result.length > 0) {
            $.each(result, function(i) {
              var item = data.result[i];

              SEMICOLON.chat.appendMsg(item, true);

              if(i === result.length - 1) {
                $thisBtn.data('msg_id', item.id);
              }
            });

            $thisBtn.html('点击查看更多');
          } else {
            /* 无聊天记录 */
            $thisBtn.addClass('disable');
            $thisBtn.html('无更多聊天记录');
          }
        } else {
          $thisBtn.html('拉取聊天记录失败，请重试');
        }
      }).fail(function(data) {
        $thisBtn.html('拉取聊天记录失败，请重试');
      });
    },

    /* 文本消息发送及相关控制 */
    submitTextMsg: function() {
      // 点击发送文本信息
      $(document).on('click', '.chat-msg-submit-btn', function() {
        if($(this).hasClass('disabled')) {
          return false;
        }

        SEMICOLON.easemob.sendText();
      });

      // 回车发送文本，Ctrl+回车换行
      $(document).on('keydown', '.chat-msg-input', function(event) {
        var $el = $(this),
            thisVal = $el.val();

        if(event.ctrlKey && event.keyCode === 13) {
          $el.val(thisVal + '\n');
        } else if(event.keyCode === 13) {
          if($.trim(thisVal) === '' || thisVal.length > wordLimit) {
            return false;
          }

          SEMICOLON.easemob.sendText();

          return false;
        }
      });

      // 发送按钮控制
      $(document).on('keyup', '.chat-msg-input', function() {
        var $el = $(this),
            thisVal = $el.val(),
            $submitBox = $el.next('.chat-msg-submit'),
            $submitBtn = $submitBox.find('.chat-msg-submit-btn');

        if($submitBox.find('.chat-msg-submit-hint').length) {
          $submitBox.find('.chat-msg-submit-hint').remove();
        }

        // 启用或者禁用发送按钮
        if($.trim(thisVal) !== '' && thisVal.length <= wordLimit) {
          $submitBtn.removeClass('disabled');
        } else if(thisVal.length > wordLimit) {
          var $hintClone = $textSendHint.clone();

          $hintClone.append('字数不能超过' + wordLimit + '字');

          $submitBox.prepend($hintClone);

          $submitBtn.addClass('disabled');
        } else {
          $submitBtn.addClass('disabled');
        }
      });

      // 输入框失去焦点，如有文字就要创建最近会话列表
      $(document).on('blur', '.chat-msg-input', function() {
        var $el = $(this),
            thisVal = $.limitText($el.val(), 3);

        if(thisVal !== '') {
          var $curChatWindow = $('.qn-pager-chat-box').find('.active'),
              localTime = SEMICOLON.chat.getLocalTime('hh:mm'),
              recentData = {};

          // 更新最近会话列表，并构建最近会话所所需内容集
          recentData['imid'] = curChatId;
          recentData['type'] = curChatType === 'groupchat' ? 'R' : 'F';
          recentData['content'] = '[草稿]' + thisVal;
          recentData['time'] = localTime;

          if(curChatType === 'groupchat') {
            recentData['charge'] = $curChatWindow.data('charge');
            recentData['owner'] = $curChatWindow.data('owner');
            recentData['owner_imid'] = $curChatWindow.data('owner_imid');
          }

          // 如果联系人项中有该项，直接更新内容，如果没有就创建
          if($('#qn-pager-recent-box').find('.contacts-item-' + curChatId).length) {
            $('#qn-pager-recent-box').find('.contacts-item-' + curChatId).find('.contacts-content').html('[草稿]' + thisVal);
          } else {
            SEMICOLON.contacts.createRecentItem(recentData);
          }
        }
      });
    },

    /*
     * 消息显示的统一处理方法
     * @message: 消息对象
     * @isHistoryMsg: 是消息记录
     */
    appendMsg: function(message, isHistoryMsg) {
      var from = message.from, // 发信人
          to = message.to, // 收信人
          id = message.id, // 消息ID
          content = message.data, // 消息内容
          type = message.type, // 消息类型
          ext = message.ext, // 扩展信息
          extType = ext.qnMsgType, // 扩展消息类型
          $belongTo, // 所属聊天窗口
          belongToId, // 所属聊天窗口ID
          localMsg = null,
          recentData = {},
          recentContent = '';  // 最近会话项要显示的内容

      // 判断信息要显示在哪个窗口
      if(from === curUserId) {
        belongToId = to;
      } else {
        if(type === 'groupchat') {
          belongToId = to;
        } else {
          belongToId = from;
        }
      }

      $belongTo = $('.qn-pager-chat-item-' + belongToId);

      // 判断聊天窗口是否创建，没有则创建
      if(!$belongTo.length) {
        var createChatData = {};

        if(type === 'groupchat') {
          /* 创建直播群聊天窗口 */
          var $thisRoom = $('#qn-pager-contacts-box').find('.contacts-item-' + belongToId);

          if(!$thisRoom.length) {
            /* 没有该直播群项，查询后创建 */
            SEMICOLON.contacts.getLiveRoomInfo(belongToId, 2);
          } else {
            /* 有该直播群项，直接创建 */

            // 创建聊天窗口所需参数
            createChatData['type'] = 'R';
            createChatData['name'] = $thisRoom.find('.contacts-title').html();
            createChatData['id'] = belongToId;
            createChatData['charge'] = $thisRoom.data('charge');
            createChatData['owner'] = $thisRoom.data('owner');
            createChatData['ownerImId'] = $thisRoom.data('owner_imid');

            SEMICOLON.chat.createChatWindow(createChatData);
          }
        } else {
          /* 创建单聊窗口 */

          // 创建聊天窗口所需参数
          createChatData['type'] = 'F';
          createChatData['name'] = ext.qnNickName;
          createChatData['id'] = belongToId;

          SEMICOLON.chat.createChatWindow(createChatData);
        }

        $belongTo = $('.qn-pager-chat-item-' + belongToId);
      }

      // 环信过道手
      if(typeof content === 'string') {
        localMsg = Easemob.im.Helper.parseTextMessage(content);
        localMsg = localMsg.body;
      } else {
        if(!isHistoryMsg) {
          localMsg = message.data.data;
        } else {
          if(message.msgType === 1) {
            /* 聊天记录里的图片，拿出来单独处理 */
            var newHistoryImg = {};

            newHistoryImg['type'] = 'pic';
            newHistoryImg['data'] = message.url;

            localMsg = [];

            localMsg.unshift(newHistoryImg);

            message['data'] = '[图片]';
          }
        }
      }

      // 处理消息体
      for(var i = 0; i < localMsg.length; i++) {
        var msgItem = localMsg[i],
            msgType = msgItem.type,
            msgData = msgItem.data,
            $msgContainerClone = $msgContainer.clone(),
            $msgClone,
            msgIcon,
            $msgNickname,
            recentMsg = $.limitText(message.data, 7), // 显示在最近会话项里的内容
            localTime = SEMICOLON.chat.getLocalTime('hh:mm'); // 本地时间

        // 判断是否要插入消息时间
        if(!isHistoryMsg) {
          if($belongTo.find('.chat-content li').length < 1) {
            /* 如果该条信息为当前窗口的第一条信息，则显示时间 */
            SEMICOLON.chat.appendMsgTime(localTime, $msgContainerClone);
          } else if(everyMinute !== localTime) {
            /* 如果距离上次显示时间已经过了一分钟，那么显示时间 */
            SEMICOLON.chat.appendMsgTime(localTime, $msgContainerClone);
          }
        }

        // 添加消息ID， 用来追加头像和查找头像
        $msgContainerClone.addClass('easemob-msg-' + id);
        $msgContainerClone.addClass('easemob-msg-contacts-' + from);

        // 判断消息类型
        if(msgType === 'emotion') {
          /* 表情 */
          var $emotionImg = $('<img src="' + msgData + '">');

          $msgClone = $msgBasis.clone();

          $msgClone.append($emotionImg);
        } else if(msgType === 'pic' || msgType === 'audio' || msgType === 'video') {
          switch(msgType) {
            case 'pic':
              var $imgMsgEl = msgItem.data;

              recentContent = '[图片]';

              $msgClone = SEMICOLON.chat.createImgMsg($imgMsgEl, isHistoryMsg);
              break;
            case 'audio':
              /* 音频预留 */
              break;
            case 'video':
              /* 视频预留 */
              break;
          }
        } else if(msgType === 'txt') {
          recentContent = content;

          switch(extType) {
            case 0:
              // 纯文本
              $msgClone = $msgBasis.clone();

              msgData = $.filterScriptLabel(msgData);

              msgData = msgData.replace(/\n/g, '<br>');

              $msgClone.append(msgData);
              break;
            case 4:
              // 分享组合
              $msgClone = SEMICOLON.chat.createCustomMsg(4, ext.qnPtfInfo, 0);
              break;
            case 5:
              // 分享股票
              $msgClone = SEMICOLON.chat.createCustomMsg(5, ext.qnStockInfo, 0);
              break;
            case 6:
              // 分享资讯
              $msgClone = SEMICOLON.chat.createCustomMsg(6, ext.qnNewsInfo, 1);
              break;
            case 7:
              // 开户服务
              $msgClone = SEMICOLON.chat.createCustomMsg(7, ext.qnAdviserOpenServe, 1);
              break;
            case 8:
              // 分享投资圈动态
              $msgClone = SEMICOLON.chat.createCustomMsg(8, ext.qnNoteInfo, 0);
              break;
            case 9:
              // 分享观点
              $msgClone = SEMICOLON.chat.createCustomMsg(9, ext.qnAdviserViewpointInfo, 1);
              break;
            case 10:
              // 红包信息
              $msgClone = SEMICOLON.chat.createRewardMsg(ext.qnReward);
              break;
          }
        }

        // 判断是否是本人发出的信息
        if(from === curUserId) {
          /* 我的信息 */
          $msgContainerClone.addClass('myself-msg');

          msgIcon = $('#header-user-avatar-box img').attr('src');
        } else {
          /* 其他人的信息 */
          $msgContainerClone.addClass('friends-msg');

          var $msgToContactsItem = $('#qn-pager-contacts-box').find('.contacts-item-' + from),
              $msgToContactsMsgItem = $belongTo.find('.easemob-msg-contacts-' + from);

          if($msgToContactsItem.length) {
            /* 查看联系人列表里是否有该用户，有则拿头像 */
            msgIcon = $msgToContactsItem.find('.qn-avatar img').attr('src');
          } else if($msgToContactsMsgItem.length) {
            /* 查看当前会话窗口中是否有该用户的发言，有则拿头像 */
            msgIcon = $msgToContactsMsgItem.find('.qn-avatar img').attr('src');
          }
        }

        // 如果是群信息则加上名称
        if(type === 'groupchat') {
          var nickname = message.ext.qnNickName;

          $msgNickname = $('<span class="msg-username">' + nickname + '</span>');

          // 是否是群主
          var ownerId = $belongTo.data('owner_imid');

          if(from === ownerId && from === curUserId) {
            $msgNickname.append('<i>群主</i>');
          } else if(from === ownerId) {
            $msgNickname.prepend('<i>群主</i>');
          }

          $msgContainerClone.find('.msg-wrap').prepend($msgNickname);
        }

        // 将获取到的头像加入消息容器，如果头像未定义，往下走会有追加方法
        $msgContainerClone.find('.qn-avatar img').attr('src', msgIcon);

        // 将消息气泡塞入消息项容器中
        $msgContainerClone.find('.msg-wrap').append($msgClone);

        // 追加消息
        if(!isHistoryMsg) {
          $belongTo.find('.chat-content').append($msgContainerClone);
        } else {
          /* 是消息记录 */
          $belongTo.find('.chat-content').prepend($msgContainerClone);
        }

        // 没有头像，查询用户信息，追加头像（不要怀疑，写在这里是为了防止消息多，卡死）
        if(msgIcon === undefined || msgIcon === '') {
          SEMICOLON.chat.appendMsgIcon(from, id, $belongTo);
        }

        // 如果不是消息记录
        if(!isHistoryMsg) {
          // 更新最近会话列表，并构建最近会话所所需内容集
          recentData['imid'] = belongToId;
          recentData['type'] = type === 'groupchat' ? 'R' : 'F';
          recentData['content'] = recentContent;
          recentData['time'] = localTime;

          if(type === 'groupchat') {
            recentData['charge'] = $belongTo.data('charge');
            recentData['owner'] = $belongTo.data('owner');
            recentData['owner_imid'] = $belongTo.data('owner_imid');
          }

          SEMICOLON.contacts.createRecentItem(recentData);

          // 不是本人发出的消息则追加消息打点
          if(from !== curUserId && !$belongTo.hasClass('active')) {
            SEMICOLON.chat.appendMsgBadge(belongToId);
          } else if($belongTo.hasClass('active') && !$('#qn-pager-minimize').hasClass('hide')) {
            SEMICOLON.chat.appendMsgBadge(belongToId);
          }

          // 滚动条置底
          SEMICOLON.chat.chatScrollToBottom($belongTo);
        }
      }
    },

    /*
     * 追加消息时间
     * @time: 显示的时间
     * @$msgContainer: 消息容器
     */
    appendMsgTime: function(time, $msgContainer) {
      var $sysTimeClone = $msgTime.clone();

      $sysTimeClone.find('.time').html(time);

      $msgContainer.prepend($sysTimeClone);

      // 更新下次要显示的时间对比项
      everyMinute = time;
    },

    /*
     * 追加消息头像
     * @id: 环信ID
     * @msgId: 需要追加的消息ID
     * @$toChatWin: 需追加消息的消息窗口
     */
    appendMsgIcon: function(id, msgId, $toChatWin) {
      var msgIcon = $.checkUserIcon(), // 默认头像
          url = '/contacts/user_info',
          param = {},
          params = {};

      param['imIds'] = [id];
      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        /* 追加消息头像（写在这里因为防止消息太多卡死，所以异步来搞） */
        if(data.code === 0) {
          if(data.result !== undefined && data.result.data.length > 0) {
            var infoData = data.result.data;

            $.each(infoData, function(i) {
              var infoItem = infoData[i];

              msgIcon = infoItem.userIcon;
            });
          }
        }

        // 插入头像
        $toChatWin.find('.easemob-msg-' + msgId).find('.qn-avatar img').attr('src', msgIcon);

        $toChatWin.find('.easemob-msg-' + msgId).find('.msg-box').data('icon', msgIcon);
      }).fail(function(data) {
        // 插入头像
        $toChatWin.find('.easemob-msg-' + msgId).find('.qn-avatar img').attr('src', msgIcon);
      });
    },

    /*
     * 创建图片消息显示
     * @$img: 图片元素
     */
    createImgMsg: function($img, isHistoryMsg) {
      var $msgImgClone = $msgImg.clone();

      if(!isHistoryMsg) {
        $msgImgClone.append($img);
      } else {
        var $newImg = $('<img src="' + $img + '" width="250">');

        $msgImgClone.append($newImg);
      }

      return $msgImgClone;
    },

    /*
     * 创建自定义消息显示
     * @type: 消息类型
     * @message: 消息体
     * @disable: 是否可以打开连接, 0: 不能, 1: 能
     */
    createCustomMsg: function(type, message, disable) {
      var $msgCustomClone = $msgCustom.clone(),
          icon,
          title,
          content,
          url = '';

      switch(type) {
        case 4:
          /* 分享组合 */
          icon = '/images/pager/msg_ext_4.png';
          title = $.limitText(message.ptfName, 15);
          content = '日收益：' + message.tdYield + '<br>' +
                  '总收益：' + message.tYield + '<br>' +
                  message.time;
          break;
        case 5:
          /* 股票消息 */
          icon = '/images/pager/msg_ext_5.png';
          title = message.name + '(' +
                message.market +
                message.code + ')';
          content = '最新价：' + message.price + '<br>' +
                  '日涨跌：' + message.changePercent + '<br>' +
                  message.time;
          break;
        case 6:
          /* 分享资讯 */
          icon = '/images/pager/msg_ext_6.png';
          title = $.limitText(message.title, 15);
          content = $.limitText(message.content, 30);

          if(disable === 1) {
            url = 'https://api.yiqiniu.com:9003/webstatic/news/news.html?type=' + message.type + '&artid=' + message.newsId;
          }
          break;
        case 7:
          /* 开户服务 */
          icon = message.iconUrl;
          title = $.limitText('“' + message.name + '”向您提供开户服务', 15);
          content = $.limitText(message.content, 30);

          if(disable === 1) {
            url = message.detailUrl;
          }
          break;
        case 8:
          /* 分享投资圈动态 */
          icon = message.userIcon;
          title = $.limitText(message.title, 15);
          content = $.limitText(message.desc, 30);
          break;
        case 9:
          /* 分享观点 */
          icon = '/images/pager/msg_ext_9.png';
          title = $.limitText(message.viewpointTitle, 15);
          content = $.limitText(message.viewpointContent, 30);

          if(disable === 1) {
            url = message.viewpointUrl;
          }
          break;
      }

      if(disable === 1) {
        $msgCustomClone.data('url', url);
      } else {
        $msgCustomClone.addClass('disable');
        $msgCustomClone.append('<div class="msg-custom-footer">暂时只能在一起牛APP中打开</div>');
      }

      $msgCustomClone.find('.msg-custom-main h5').html(title);
      $msgCustomClone.find('.custom-content-icon img').attr('src', icon);
      $msgCustomClone.find('.custom-content').html(content);

      return $msgCustomClone;
    },

    /*
     * 创建红包消息显示
     * @info: 红包信息
     */
    createRewardMsg: function(info) {
      var $msgRewardClone = $msgReward.clone(),
          from = info.fromImId,
          to = info.toUserId,
          icon = $.checkUserIcon(),
          nickname = info.fromNickname,
          simple = info.simpleContent,
          amount = info.amount;

      $msgRewardClone.find('.msg-reward-main').append(simple);
      $msgRewardClone.data('icon', icon);
      $msgRewardClone.data('nickname', nickname);

      // 如果当前用户是发送人或者是群主则可以看到金额
      if(from === curUserId || to === $('#header-user-avatar-box').data('id')) {
        $msgRewardClone.data('amount', amount);
      }

      return $msgRewardClone;
    },

    /* 打开自定义消息 */
    openCustomMsg: function() {
      $(document).on('click', '.msg-box', function() {
        var $el = $(this);

        if($el.hasClass('custom') && !$el.hasClass('disable')) {
          var url = $el.data('url');

          window.open(url);
        }
      });
    },

    /* 操作红包消息 */
    handleRewardMsg: function() {
      // 打开红包
      $(document).on('click', '.msg-box', function() {
        var $el = $(this);

        if($el.hasClass('reward')) {
          var $rewardInfo = $msgRewardInfo.clone(),
              icon = $el.data('icon'),
              nickname = $el.data('nickname'),
              amount = $el.data('amount');

          $rewardInfo.find('span.qn-avatar img').attr('src', icon);
          $rewardInfo.find('h4.nickname').html(nickname);
          $rewardInfo.find('.qn-reward-info-main').find('i.nickname').html(nickname);

          if(amount) {
            $rewardInfo.find('.qn-reward-info-main span').prepend(amount);
          } else {
            $rewardInfo.find('.qn-reward-info-main span').remove();
          }

          $('html').addClass('qn-popup-lock');
          $('body').append($rewardInfo);
        }
      });

      // 点击任何地方关闭红包详情
      $(document).on('click', function(event) {
        if(!$(event.target).closest('.qn-reward-token').length) {
          $('html').removeClass('qn-popup-lock');
          $('.qn-popup-overlay').remove();
        }
      });
    },

    /*
     * 聊天窗口滚动条置底
     * @$scrollWindow: 需要滚动聊天窗口
     */
    chatScrollToBottom: function($scrollWindow) {
      var winScrollHeight = $scrollWindow.find('.chat-main')[0].scrollHeight;

      $scrollWindow.find('.chat-main').scrollTop(winScrollHeight);
    },

    /*
     * 追加消息打点
     * @belongToId: 所属联系项ID
     */
    appendMsgBadge: function(belongToId) {
      var $totalBadge = $('#qn-pager-minimize').find('.qn-badge'),
          $itemBadge = $('#qn-pager-recent-box').find('.contacts-item-' + belongToId).find('.qn-badge'),
          $newBadge = $badgeHtml.clone(), // 新打点
          totalNum, // 未读消息总数
          itemNum; // 该项未读消息总数

      if(!$totalBadge.length) {
        /* 如果一条未读消息都没有 */
        var $newTotalBadge = $badgeHtml.clone();

        $newTotalBadge.data('num', 1);
        $newTotalBadge.html(1);

        $newBadge.data('num', 1);
        $newBadge.html(1);

        $('#qn-pager-minimize').append($newTotalBadge);
        $('#qn-pager-recent-box').find('.contacts-item-' + belongToId + ' a').append($newBadge);
      } else if(!$itemBadge.length) {
        /* 该联系项一条未读消息都没有 */
        totalNum = $totalBadge.data('num') + 1;

        $totalBadge.data('num', totalNum);

        totalNum = totalNum < 100 ? totalNum : '99+';

        $totalBadge.html(totalNum);

        $newBadge.data('num', 1);
        $newBadge.html(1);

        $('#qn-pager-recent-box').find('.contacts-item-' + belongToId + ' a').append($newBadge);
      } else {
        totalNum = $totalBadge.data('num') + 1;
        itemNum = $itemBadge.data('num') + 1;

        $totalBadge.data('num', totalNum);

        totalNum = totalNum < 100 ? totalNum : '99+';

        $totalBadge.html(totalNum);

        $itemBadge.data('num', itemNum);

        itemNum = itemNum < 100 ? itemNum : '99+';

        $itemBadge.html(itemNum);
      }
    },

    /*
     * 删除删除打点
     * @id: 删除项的ID
     */
    deleteMsgBadge: function(id) {
      var $deleteItem = $('#qn-pager-recent-box').find('.contacts-item-' + id),
          badgeNum = $deleteItem.find('.qn-badge').data('num'),
          totalBadgeNum = $('#qn-pager-minimize').find('.qn-badge').data('num');

      $deleteItem.find('.qn-badge').remove();

      // 剩余的打点数
      var surplusBadgeNum = totalBadgeNum - badgeNum;

      if(surplusBadgeNum > 0 && surplusBadgeNum < 100) {
        $('#qn-pager-minimize').find('.qn-badge').data('num', surplusBadgeNum);
        $('#qn-pager-minimize').find('.qn-badge').html(surplusBadgeNum);
      } else if(surplusBadgeNum >= 100) {
        $('#qn-pager-minimize').find('.qn-badge').data('num', surplusBadgeNum);
        $('#qn-pager-minimize').find('.qn-badge').html('99+');
      } else if(surplusBadgeNum <= 0) {
        $('#qn-pager-minimize').find('.qn-badge').remove();
      }
    }
  };

  /*
   * 群管理相关
   * @init: 初始化方法
   * @chooseManageWindow: 切换管理页面
   * @showManageWindow: 显示直播群管理页面
   * @hiddenManageWindow: 隐藏管理窗口
   * @createMembersWindow: 创建群成员列表窗口
   * @queryMembers: 查询成员
   * @submitFuzzyQueryMembers: 提交模糊查询成员
   * @fuzzyQueryMembers: 模糊查询成员
   * @createMemberItem: 创建群成员项
   * @checkMember: 选择群成员
   * @handleDeleteMember: 执行删除群成员
   * @createAddMemberWindow: 创建邀请新成员窗口
   * @createRoomInfoWindow: 创建直播群信息窗口
   * @handleLogoutLiveRoom: 操作退出直播群按钮
   * @logoutLiveRoom: 退出直播群
   */
  SEMICOLON.manage = {
    init: function() {
      SEMICOLON.manage.chooseManageWindow();
      SEMICOLON.manage.handleRoomMemberPageNav();
      SEMICOLON.manage.submitFuzzyQueryMembers();
      SEMICOLON.manage.handleDeleteMember();
      SEMICOLON.manage.checkNewMember();
      SEMICOLON.manage.submitNewMember();
      SEMICOLON.manage.handleRoomBasicInfo();
      SEMICOLON.manage.handleRoomNotice();
      SEMICOLON.manage.handleRoomAuthentication();
      SEMICOLON.manage.handleRoomPrice();
    },

    /* 切换管理窗口 */
    chooseManageWindow: function() {
      $(document).on('click', '.show-manage-btn', function() {
        var $el = $(this),
            mark = $el.data('mark'), // 要加载窗口的对应标记
            groupId = $el.data('id'), // 群组的ID
            owner = $el.data('owner'), // 是否为群主
            charge = $el.data('charge'), // 是否为收费群
            createData = {};

        switch(mark) {
          case 'member-list':
            /* 群成员列表 */
            createData['groupId'] = groupId;
            createData['owner'] = owner;
            createData['charge'] = charge;
            createData['pageNo'] = 1;
            createData['pageCount'] = 8;
            break;
          case 'add-member':
            /* 邀请新成员 */
            createData['groupId'] = groupId;
            createData['owner'] = owner;
            createData['charge'] = charge;
            break;
          case 'room-info':
            /* 查看群消息 */
            createData['id'] = groupId;
            createData['owner'] = owner;
            createData['charge'] = charge;
            break;
        }

        SEMICOLON.manage.showManageWindow(mark, createData);
      });

      $(document).on('click', '.hide-manage-btn', function() {
        var $el = $(this),
            mark = $el.data('mark'),
            id = $el.data('id');

        SEMICOLON.manage.hiddenManageWindow(mark, id);
      });
    },

    /*
     * 显示管理窗口
     * @mark: 显示窗口的类型
     * @createData: 构建窗口所需的参数
     */
    showManageWindow: function(mark, createData) {
      var $curManageWindow = $('#qn-pager-group-manage-' + mark),
          $returnBtn = $windowReturnBtn.clone();

      // 根据不同的标记，去创建不同的窗口
      switch(mark) {
        case 'member-list':
          /* 群成员列表 */
          SEMICOLON.manage.createMembersWindow($curManageWindow, createData);
          break;
        case 'add-member':
          /* 邀请新成员 */
          SEMICOLON.manage.createAddMemberWindow($curManageWindow, createData);
          break;
        case 'room-info':
          /* 查看群消息 */
          SEMICOLON.manage.createRoomInfoWindow($curManageWindow, createData);
          break;
      }

      // 创建返回按钮
      $returnBtn.data('mark', mark);

      var $oldBtn = $('#qn-pager-title').find('.qn-pager-return-window'),
          btnId;

      if($oldBtn.length) {
        btnId = $oldBtn.eq(0).data('id') + 1;
      } else {
        btnId = 1;
      }

      $returnBtn.attr('id', 'qn-pager-return-window-' + btnId);
      $returnBtn.data('id', btnId);

      $oldBtn.hide();

      $('#qn-pager-title').prepend($returnBtn);
      $('#qn-pager-return-window-' + btnId).fadeIn();

      // 展开页面
      $curManageWindow.addClass('active');

      $curManageWindow.animate({
        'left': 0
      }, 500);
    },

    /*
     * 隐藏管理窗口
     * @mark: 标记
     * @id: 返回按钮的ID
     * @extend: 扩展
     */
    hiddenManageWindow: function(mark, id, extend) {
      var $curManageWindow = $('#qn-pager-group-manage-' + mark),
          $thisBtn = $('#qn-pager-title').find('#qn-pager-return-window-' + id);

      $thisBtn.fadeOut(function() {
        $thisBtn.remove();
      });

      $curManageWindow.animate({
        'left': '965px'
      }, 500, function() {
        $curManageWindow.removeClass('active');

        $('#qn-pager-title').find('#qn-pager-return-window-' + (id - 1)).fadeIn();

        // 如果是邀请新成员窗口
        if(mark === 'add-member') {
          /* 清空联系人列表 */
          var $groupItem = $('.qn-pager-add-member-contacts-list').find('.qn-pager-contacts-group');

          $groupItem.each(function() {
            $(this).data('version', 0); // 增量拉取版本号
            $(this).data('been', 0); // 分组下已加载项的数量
            $(this).find('.qn-pager-contacts-list').empty(); // 清空列表

            $(this).find('.group-title').find('.fa').removeClass('fa-caret-down').addClass('fa-caret-right');
            $(this).removeClass('open');

            addMemberArray.length = 0;
          });

          $('.qn-pager-add-member-selected-title').find('i').html(addMemberArray.length);

          $('.alternative-new-member-list').find('.qn-pager-contacts-list').empty();
        }

        // 开启新的窗口
        if(extend) {
          if(mark === 'room-info' && extend.type === 'edit') {
            SEMICOLON.manage.showManageWindow('room-info', extend.data);
          }
        }
      });
    },

    /*
     * 创建群成员列表窗口
     * @$curManageWindow: 当前展开的窗口
     * @createData: 构建窗口所需的参数，参数内容如下:
     * * @groupId: 群组ID
     * * @pageNo: 拉取的页码
     * * @pageCount: 每页的条数，可不传
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @charge: 是否收费, N: 不收, Y: 收
     */
    createMembersWindow: function($curManageWindow, createData) {
      var owner = createData.owner,
          charge = createData.charge,
          $table = $membersList.clone(),
          $theadTh = $table.find('thead').find('tr').eq(0).find('th');

      // 清空删除数组
      deleteMemberArray.length = 0;

      // 设置搜索组件的属性
      $curManageWindow.find('#query-room-members-input').val('');
      $curManageWindow.find('#query-room-members-btn').data('id', createData.groupId);
      $curManageWindow.find('#query-room-members-btn').data('owner', owner);
      $curManageWindow.find('#query-room-members-btn').data('charge', charge);

      // 是否添加操作按钮
      switch(owner) {
        case 1:
          $curManageWindow.find('.qn-pager-group-manage-member-header .col-xs-5').html($operateMembersBtns.clone());

          $('#delete-room-member-btn').data('id', createData.groupId);
          $('#delete-room-member-btn').data('owner', owner);
          $('#delete-room-member-btn').data('charge', charge);

          $('#add-room-member-btn').data('id', createData.groupId);
          $('#add-room-member-btn').data('owner', owner);
          $('#add-room-member-btn').data('charge', charge);
          break;
        case 0:
          $curManageWindow.find('.qn-pager-group-manage-member-header .col-xs-5').empty();
          break;
      }

      // 判断视角，创建表格
      if(owner === 0) {
        /* 成员视角 */
        $theadTh.eq(1).remove();
        $theadTh.eq(2).remove();
        $theadTh.eq(3).remove();
      } else if(owner === 1 && charge === 'N') {
        /* 群主视角，免费群 */
        $theadTh.eq(1).remove();
      }

      // 添加列表至窗口
      $table.attr('id', 'room-member-list-table');

      $curManageWindow.find('.qn-pager-group-manage-member-main .col-xs-12').html($table);

      // 美化单、多选框
      $('input.delete-member-check').iCheck({
        checkboxClass: 'qn-icheckbox',
        radioClass: 'qn-iradio'
      });

      // 查询群成员
      SEMICOLON.manage.queryMembers($table, createData);
    },

    /*
     * 查询成员
     * @$belong: 追加的表格
     * @data: 查询群成员所需参数，参数内容如下:
     * * @groupId: 群组ID
     * * @pageNo: 拉取的页码
     * * @pageCount: 每页的条数，可不传
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @charge: 是否收费, N: 不收, Y: 收（这个方法中无用）
     */
    queryMembers: function($belong, data) {
      // 取消全选
      $('#check-all-member').iCheck('uncheck');

      var groupId = data.groupId,
          pageNo = data.pageNo,
          pageCount = data.pageCount,
          owner = data.owner,
          charge = data.charge,
          url = '/live_room/members',
          param = {},
          params = {};

      param['groupId'] = groupId;
      param['pageNo'] = pageNo;

      // 每页的条数
      if(pageCount) {
        param['pageCount'] = pageCount;
      } else {
        param['pageCount'] = 8;
      }

      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
          var $nullTr = $noResultTr.clone();

          $nullTr.find('td').html('加载中…');

          $belong.find('tbody').html($nullTr);
        }
      }).done(function(data) {
        if(data.code === 0) {
          $belong.find('tbody').empty();

          var result = data.result,
              list = result.data,
              curPage = result.pageNo, // 当前页码
              totalPage = result.totalPage, // 总页码
              pageNavClass = 'room-member-list-page-nav';

          $.each(list, function(i) {
            var item = list[i],
                $tr;

            $tr = SEMICOLON.manage.createMemberItem(owner, charge, item);

            $belong.find('tbody').append($tr);
          });

          // 美化单、多选框
          $('input.delete-member-check').iCheck({
            checkboxClass: 'qn-icheckbox',
            radioClass: 'qn-iradio'
          });

          SEMICOLON.manage.checkMember();

          var $pageNav = $.pageNav(curPage, totalPage, pageNavClass);

          $belong.find('tfoot > tr > td').html($pageNav);
        } else {
          $belong.find('tbody > tr').eq(0).find('td').html('查询失败，请重试');
        }
      }).fail(function(data) {
        $belong.find('tbody > tr').eq(0).find('td').html('查询失败，请重试');
      });
    },

    /* 操作群成员列表分页 */
    handleRoomMemberPageNav: function() {
      $(document).on('click', '.room-member-list-page-nav', function() {
        var $el = $(this),
            curPage = $el.data('num'),
            queryData = {};

        queryData['groupId'] = $('#query-room-members-btn').data('id');
        queryData['pageNo'] = curPage;
        queryData['pageCount'] = 8;
        queryData['owner'] = $('#query-room-members-btn').data('owner');
        queryData['charge'] = $('#query-room-members-btn').data('charge');

        SEMICOLON.manage.queryMembers($('#room-member-list-table'), queryData);
      });
    },

    /* 提交模糊查询成员 */
    submitFuzzyQueryMembers: function() {
      $('#query-room-members-btn').click(function() {
        var $el = $(this),
            $table = $el.closest('#qn-pager-group-manage-member-list').find('.qn-table'),
            id = $el.data('id'),
            owner = $el.data('owner'),
            charge = $el.data('charge'),
            queryContent = $.trim($('#query-room-members-input').val()),
            queryData = {};

        queryData['groupId'] = id;
        queryData['searchContent'] = queryContent;
        queryData['pageNo'] = 1;
        queryData['owner'] = owner;
        queryData['charge'] = charge;

        SEMICOLON.manage.fuzzyQueryMembers($table, queryData);
      });
    },

    /*
     * 模糊查询成员
     * @$belong: 追加的表格
     * @data: 模糊查询群成员所需参数，参数内容如下:
     * * @groupId: 群组ID
     * * @searchContent: 查询的内容
     * * @pageNo: 拉取的页码
     * * @pageCount: 每页的条数，可不传
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @charge: 是否收费, N: 不收, Y: 收
     */
    fuzzyQueryMembers: function($belong, data) {
      // 清空删除数组
      deleteMemberArray.length = 0;
      $('#check-all-member').iCheck('uncheck');

      var owner = data.owner,
          charge = data.charge,
          url = '/live_room/query_members',
          param = {},
          params = {};

      param['groupId'] = data.groupId;
      param['searchContent'] = data.searchContent;
      param['pageNo'] = data.pageNo;

      if(!data['pageCount']) {
        param['pageCount'] = 8;
      }

      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
          $belong.find('tbody').empty();
          $belong.find('tfoot > tr > td').empty();

          var $nullTr = $noResultTr.clone();

          $nullTr.find('td').html('搜索中…');

          $belong.find('tbody').append($nullTr);
        }
      }).done(function(data) {
        if(data.code === 0) {
          var result = data.result,
              list = result.data,
              curPage = result.pageNo,
              totalPage = result.totalPage,
              pageNavClass = 'room-member-list-page-nav';

          if(list !== undefined) {
            $belong.find('tbody').empty();

            $.each(list, function(i) {
              var item = list[i],
                  $tr;

              $tr = SEMICOLON.manage.createMemberItem(owner, charge, item);

              $belong.find('tbody').append($tr);
            });

            // 美化单、多选框
            $('input.delete-member-check').iCheck({
              checkboxClass: 'qn-icheckbox',
              radioClass: 'qn-iradio'
            });

            SEMICOLON.manage.checkMember();

            var $pageNav = $.pageNav(curPage, totalPage, pageNavClass);

            $belong.find('tfoot > tr > td').html($pageNav);
          } else {
            $belong.find('tbody > tr').eq(0).find('td').html('无搜索结果');
          }
        } else {
          $belong.find('tbody > tr').eq(0).find('td').html('查询失败，请重试');
        }
      }).fail(function(data) {
        $belong.find('tbody > tr').eq(0).find('td').html('查询失败，请重试');
      });
    },

    /*
     * 创建群成员项
     * @owner: 是否为群主，0: 不是群主, 1: 是群主
     * @charge: 是否为收费群
     * @data: 构建列表项所需参数，参数内容如下:
     * * @userId: 用户ID
     * * @memberId: 环信ID
     * * @icon: 头像
     * * @nickName: 昵称
     * * @lastActiveTs: 最后发言时间
     * * @expireTs: 服务到期时间
     * * @firstLetter: 昵称首字母
     * * @affiliation: 成员类型，M: 普通成员，S: 高级成员， O: 群主
     */
    createMemberItem: function(owner, charge, data) {
      var icon = data.icon !== undefined ? data.icon : $.checkUserIcon(),
          lastActiveTs = data.lastActiveTs, // 最后发言时间
          expireTs = data.expireTs, // 服务到期时间
          $item = $membersListItem.clone(),
          $td = $item.find('td');

      $td.eq(0).find('.qn-avatar img').attr('src', icon);
      $td.eq(0).append(data.nickName);

      // 判断操作视角
      if(owner === 0) {
        /* 群成员视角 */
        $td.eq(1).remove();
        $td.eq(2).remove();
        $td.eq(3).remove();
      } else if(owner === 1) {
        /* 群主视角 */
        lastActiveTs = lastActiveTs !== undefined ? $.formatDate(lastActiveTs, 'yyyy-MM-dd hh:mm') : '-';

        $td.eq(2).html(lastActiveTs);
        $td.eq(3).find('.icheck').val(data.memberId);

        // 如果是收费群则显示服务到期时间，相反则不显示
        if(charge === 'N') {
          $td.eq(1).remove();
        } else {
          expireTs = expireTs !== undefined ? $.formatDate(expireTs, 'yyyy-MM-dd') : '-';

          $td.eq(1).html(expireTs);
        }
      }

      return $item;
    },

    /* 选择群成员 */
    checkMember: function() {
      $('#check-all-member').on('ifClicked', function() {
        if($(this).prop('checked')) {
          // 全不选, 不要怀疑是反的
          $(this).closest('.qn-table').find('tbody').find('.icheck').each(function() {
            $(this).iCheck('uncheck');
          });
        } else {
          // 全选
          deleteMemberArray.length = 0;

          $(this).closest('.qn-table').find('tbody').find('.icheck').each(function() {
            $(this).iCheck('check');
          });
        }
      });

      // 单个选中
      $('.check-item-member').on('ifChecked', function() {
        var $el = $(this),
            val = $el.val();

        if($.inArray(val, deleteMemberArray) === -1) {
          deleteMemberArray.push(val);

          if(deleteMemberArray.length === 8) {
            $('#check-all-member').iCheck('check');
          }
        }
      });

      // 单个取消
      $('.check-item-member').on('ifUnchecked', function() {
        var $el = $(this),
            val = $el.val();

        if($.inArray(val, deleteMemberArray) !== -1) {
          $('#check-all-member').iCheck('uncheck');

          deleteMemberArray.splice($.inArray(val, deleteMemberArray), 1);
        }
      });
    },

    /* 执行删除群成员 */
    handleDeleteMember: function() {
      $(document).on('click', '#delete-room-member-btn', function() {
        var $el = $(this),
            id = $el.data('id'),
            owner = $el.data('owner'),
            charge = $el.data('charge');

        if(deleteMemberArray.length > 0) {
          $.niuConfirm('确认删除选中的群成员', function() {
            var url = '/live_room/delete_members',
                param = {},
                params = {};

            param['groupId'] = id;
            param['members'] = deleteMemberArray;
            params['params'] = param;

            $.ajax({
              type: 'POST',
              url: url,
              data: JSON.stringify(params),
              dataType: 'json',
              contentType: 'application/json',
              beforeSend: function() {
                $el.addClass('disabled');
                $el.html('<i class="fa fa-trash"></i>删除中…');
              }
            }).done(function(data) {
              $el.removeClass('disabled');
              $el.html('<i class="fa fa-trash"></i>删除成员');

              if(data.code === 0) {
                deleteMemberArray.length = 0;

                var queryData = {};

                queryData['groupId'] = id;
                queryData['owner'] = owner;
                queryData['charge'] = charge;
                queryData['pageNo'] = 1;
                queryData['pageCount'] = 8;

                SEMICOLON.manage.queryMembers($('#qn-pager-group-manage-member-list').find('.qn-table'), queryData);
              } else {
                $.niuNotice(data.message);
              }
            }).fail(function(data) {
              $el.removeClass('disabled');
              $el.html('<i class="fa fa-trash"></i>删除成员');

              $.niuNotice('删除失败，请重试');
            });
          });
        } else {
          $.niuNotice('您尚未选中群成员');
        }
      });
    },

    /*
     * 创建邀请新成员窗口
     * @$curManageWindow: 当前展开的窗口
     * @createData: 构建窗口所需的参数，参数内容如下:
     * * @groupId: 群组ID
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @charge: 是否收费, N: 不收, Y: 收
     */
    createAddMemberWindow: function($curManageWindow, createData) {
      var id = createData.groupId,
          owner = createData.owner,
          charge = createData.charge;

      $curManageWindow.find('#qn-pager-add-member-room-id').val(id);
      $curManageWindow.find('#qn-pager-add-member-room-id').data('owner', owner);
      $curManageWindow.find('#qn-pager-add-member-room-id').data('charge', charge);

      // 清空邀请新成员数组
      addMemberArray.length = 0;

      // 重置按钮
      $('#submit-new-member-btn').removeClass('disabled');
      $('#submit-new-member-btn').html('保存');
    },

    /* 选择新成员 */
    checkNewMember: function() {
      $(document).on('click', '.contacts-item', function() {
        var $el = $(this);

        if($el.hasClass('add-member') && !$el.hasClass('in-group')) {
          var uId = $el.data('uid'),
              imId = $el.data('imid');

          if(!$el.hasClass('selected-member')) {
            if($.inArray(uId, addMemberArray) === -1) {
              var $alternativeItem = $el.clone();

              // 追加备选列表项
              $alternativeItem.removeClass('add-member');
              $alternativeItem.find('.fa').removeClass('fa-plus').addClass('fa-times');
              $alternativeItem.find('.fa').data('id', uId);
              $alternativeItem.find('.fa').data('imid', imId);
              $alternativeItem.find('.fa').addClass('delete-alternative-item');
              $('.alternative-new-member-list').find('.qn-pager-contacts-list').append($alternativeItem);

              // 改变选中状态
              $el.addClass('selected-member');
              $el.find('.fa').removeClass('fa-plus').addClass('fa-check');

              // 添加至数组
              addMemberArray.push(uId);

              $('.qn-pager-add-member-selected-title').find('i').html(addMemberArray.length);
            }
          } else {
            if($.inArray(uId, addMemberArray) !== -1) {
              // 删除备选列表项
              $('.alternative-new-member-list').find('.contacts-item-' + imId).remove();

              // 改变选中状态
              $el.removeClass('selected-member');
              $el.find('.fa').removeClass('fa-check').addClass('fa-plus');

              // 从数组内删除
              addMemberArray.splice($.inArray(uId, addMemberArray), 1);

              $('.qn-pager-add-member-selected-title').find('i').html(addMemberArray.length);
            }
          }
        }
      });

      // 删除备选项
      $(document).on('click', '.delete-alternative-item', function() {
        var $el = $(this),
            uId = $el.data('id'),
            imId = $el.data('imid');

        // 改变联系人项的选中状态
        $('.qn-pager-add-member-contacts-list').find('.contacts-item-' + imId).removeClass('selected-member');
        $('.qn-pager-add-member-contacts-list').find('.contacts-item-' + imId).find('.fa').removeClass('fa-check').addClass('fa-plus');

        // 删除备选列表项
        $el.closest('.contacts-item').remove();

        // 从数组内删除
        addMemberArray.splice($.inArray(uId, addMemberArray), 1);

        $('.qn-pager-add-member-selected-title').find('i').html(addMemberArray.length);
      });
    },

    /* 提交新成员 */
    submitNewMember: function() {
      $('#submit-new-member-btn').click(function() {
        var $el = $(this);

        if(addMemberArray.length > 0) {
          var url = '/live_room/add_members',
              param = {},
              params = {};

          param['groupId'] = $('#qn-pager-add-member-room-id').val();
          param['userIds'] = addMemberArray;
          params['params'] = param;

          $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(params),
            dataType: 'json',
            contentType: 'application/json',
            beforeSend: function() {
              $el.addClass('disabled');
              $el.html('保存中…');
            }
          }).done(function(data) {
            if(data.code === 0) {
              var queryData = {},
                  returnBtnId = $('#qn-pager-title').find('.qn-pager-return-window').eq(0).data('id');

              /* 刷新成员列表 */
              queryData['groupId'] = $('#qn-pager-add-member-room-id').val();
              queryData['owner'] = $('#qn-pager-add-member-room-id').data('owner');
              queryData['charge'] = $('#qn-pager-add-member-room-id').data('charge');
              queryData['pageNo'] = 1;
              queryData['pageCount'] = 8;

              SEMICOLON.manage.queryMembers($('#qn-pager-group-manage-member-list').find('.qn-table'), queryData);

              // 收起窗口
              SEMICOLON.manage.hiddenManageWindow('add-member', returnBtnId);

              // 清空删除数组
              deleteMemberArray.length = 0;
            } else {
              $el.removeClass('disabled');
              $el.html('保存');

              $.niuNotice(data.message);
            }
          }).fail(function(data) {
            $el.removeClass('disabled');
            $el.html('保存');

            $.niuNotice('添加失败，请重试');
          });
        } else {
          $.niuNotice('您尚未选择要邀请的成员');
        }
      });
    },

    /*
     * 创建直播群信息窗口
     * @$curManageWindow: 当前展开的窗口
     * @createData: 构建窗口所需的参数，参数内容如下:
     * * @groupId: 群组ID
     * * @owner: 是否为群主, 0: 不是, 1: 是
     * * @charge: 是否收费, N: 不收, Y: 收
     */
    createRoomInfoWindow: function($curManageWindow, createData) {
      var groupId = createData.id,
          owner = createData.owner,
          charge = createData.charge,
          url = '/live_room/read',
          param = {},
          params = {};

      // 清空窗口
      $curManageWindow.empty();

      param['groupId'] = groupId;
      params['params'] = param;

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json'
      }).done(function(data) {
        if(data.code === 0) {
          var result = data.result.data,
              groupName = result.groupName, // 群名称
              icon = result.icon, // 群头像
              nickname =  '创建人：' + result.nickname, // 创建人
              description = result.description, // 群描述
              announcement = result.announcement, // 群公告
              needVerify = result.needVerify, // 群验证
              $basicInfo = $roomBasicInfo.clone(),
              $announcement = $roomAnnouncement.clone(),
              $memberOverview = $roomMemberOverview.clone(),
              $authenticationInfo,
              $priceInfo,
              $logoutBtnBox = $logoutRoom.clone(),
              $logoutBtn = $logoutBtnBox.find('.qn-btn');

          description = description !== undefined ? $.filterScriptLabel(description) : '暂无描述';

          announcement = announcement !== undefined ? $.filterScriptLabel(announcement.announcement) : '暂无群公告';

          /* 基本信息赋值 */
          $basicInfo.find('.qn-avatar img').attr('src', icon);
          $basicInfo.find('#qn-pager-room-info-name').find('.qn-control-static').html(groupName);
          $basicInfo.find('dd span').html(nickname);
          $basicInfo.find('#qn-pager-room-info-description').find('.qn-control-static').html(description);

          /* 群公告赋值 */
          $announcement.find('.qn-control-static').html(announcement);

          /* 群成员概况 */
          $memberOverview.find('.col-xs-7').html('群成员：' + result.memberCount + '&nbsp;/&nbsp;' + result.maxUsers);

          /* 群成员按钮 */
          $memberOverview.find('.show-manage-btn').data('id', groupId);
          $memberOverview.find('.show-manage-btn').data('owner', owner);
          $memberOverview.find('.show-manage-btn').data('charge', charge);

          /* 设置退出按钮 */
          $logoutBtn.data('id', groupId);

          // 判断是不是群主
          if(owner === 0) {
            /* 不是群主 */
            // 删除可编辑区
            $basicInfo.find('#qn-pager-room-info-name-input').remove();
            $basicInfo.find('#qn-pager-room-info-description-input').remove();
            $basicInfo.find('#room-info-edit-basic-info').remove();
            $announcement.find('#qn-pager-room-info-announcement-input').remove();
            $announcement.find('#room-info-edit-notice-btn').remove();

            // 群成员
            $memberOverview.find('#room-info-add-member-btn').remove();

            // 设置退出按钮
            $logoutBtn.html('退出直播群');
            $logoutBtn.data('type', 0);
          } else if(owner === 1) {
            /* 是群主 */
            // 编辑信息赋值
            $basicInfo.find('#qn-pager-room-info-name-input').val(groupName);

            if(description !== '暂无描述') {
              $basicInfo.find('#qn-pager-room-info-description-input').val(description);
            }

            if(announcement !== '暂无群公告') {
              $announcement.find('#qn-pager-room-info-announcement-input').val(announcement);
            }

            // 收费设置
            if(charge === 'Y') {
              $priceInfo = $roomPriceInfo.clone();

              var price = result.price,
                  salesPrice = result.salesPrice,
                  vipPrice = result.vipPrice,
                  priceHtml = '原价：' + price + '元/月';

              $priceInfo.find('#room-info-edit-price').data('price', price);

              if(salesPrice) {
                priceHtml += '，优惠价：' + salesPrice + '元/月';

                $priceInfo.find('#room-info-edit-price').data('sales_price', salesPrice);
              }

              if(vipPrice) {
                priceHtml += '，VIP优惠价：' + vipPrice + '元/月';

                $priceInfo.find('#room-info-edit-price').data('vip_price', vipPrice);
              }

              $priceInfo.find('.col-xs-8').html(priceHtml);
            } else {
              $authenticationInfo = $roomAuthentication.clone();

              if(needVerify === 'N') {
                $authenticationInfo.find('.qn-control-static').html('所有客户可加入');

                $authenticationInfo.find('#qn-pager-room-info-need-verify-n').attr('checked', true);
              } else if(needVerify === 'Y') {
                $authenticationInfo.find('.qn-control-static').html('需我验证通过才能加入');

                 $authenticationInfo.find('#qn-pager-room-info-need-verify-y').attr('checked', true);
              }
            }

            // 设置退出按钮
            $logoutBtn.html('解散直播群');
            $logoutBtn.data('type', 1);
          }

          // 将信息添加至窗口
          if(charge === 'Y') {
            $curManageWindow.prepend($priceInfo);
          }

          $curManageWindow.prepend($memberOverview);

          if(owner === 1 && charge === 'N') {
            $curManageWindow.prepend($authenticationInfo);

            // 美化单、多选框
            $('input.setting-verify-radio').iCheck({
              checkboxClass: 'qn-icheckbox',
              radioClass: 'qn-iradio'
            });
          }

          $curManageWindow.prepend($announcement);
          $curManageWindow.prepend($basicInfo);
          $curManageWindow.append($logoutBtnBox);

          // 绑定退出事件
          SEMICOLON.manage.handleLogoutLiveRoom();
        }
      }).fail(function(data) {
        console.log('失败');
      });
    },

    /* 操作群基本信息按钮 */
    handleRoomBasicInfo: function() {
      // 开启编辑
      $(document).on('click', '#room-info-edit-basic-info', function() {
        var $el = $(this),
            $submitBtn = $('<button type="submit" id="submit-room-info-edit-basic" class="qn-btn primary">保存</button>'),
            $cancelBtn = $('<a href="javascript:" id="cancel-room-info-edit-basic" class="qn-btn">取消</a>');

        $el.after($submitBtn);
        $el.after($cancelBtn);
        $el.addClass('hide');

        $el.closest('.row').find('.col-xs-8').find('.qn-form-control').removeClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-control-static').addClass('hide');

        var rules = {
              qn_pager_room_info_name_input: {
                required: true,
                minlength: 1,
                maxlength: 10,
                titleNull: true
              },
              qn_pager_room_info_description_input: {
                maxlength: 50
              }
            },
            messages = {
              qn_pager_room_info_name_input: {
                required: '<i class="fa fa-times"></i>直播群名称不能为空',
                minlength: $.validator.format('<i class="fa fa-times"></i>直播群名称不能超过{0}个字符'),
                maxlength: $.validator.format('<i class="fa fa-times"></i>直播群名称不能超过{0}个字符')
              },
              qn_pager_room_info_description_input: {
                maxlength: $.validator.format('<i class="fa fa-times"></i>直播群描述不能超过{0}个字符')
              }
            },
            submit = function(form) {
              var $form = $(form),
                  $submitBtn = $('#submit-room-info-edit-basic'),
                  url = $form.attr('action'),
                  type = $form.attr('method').toUpperCase(),
                  formData = $.serializeFormObject(form),
                  params = {},
                  param = {},
                  flag = 1 << 1 | 1 << 2;

              param['groupName'] = formData.qn_pager_room_info_name_input;
              param['description'] = formData.qn_pager_room_info_description_input;
              param['flag'] = flag;
              param['groupId'] = $('#logout-live-room-btn').data('id');

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
                  $submitBtn.html('设置中…');
                }
              }).done(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                if(data.code === 0) {
                  var newName = $('#qn-pager-room-info-name-input').val();

                  newName = $.filterScriptLabel(newName);

                  $('#qn-pager-room-info-name-input').siblings('.qn-control-static').html(newName);
                  $('#qn-pager-room-info-name-input').siblings('.qn-control-static').removeClass('hide');
                  $('#qn-pager-room-info-name-input').addClass('hide');

                  var newDescription = $('#qn-pager-room-info-description-input').val();

                  newDescription = $.filterScriptLabel(newDescription);

                  newDescription = newDescription.replace(/\n/g, '<br>');

                  $('#qn-pager-room-info-description-input').siblings('.qn-control-static').html(newDescription);
                  $('#qn-pager-room-info-description-input').siblings('.qn-control-static').removeClass('hide');
                  $('#qn-pager-room-info-description-input').addClass('hide');

                  $('#submit-room-info-edit-basic').remove();
                  $('#cancel-room-info-edit-basic').remove();
                  $('#room-info-edit-basic-info').removeClass('hide');
                } else {
                  $.niuNotice('设置失败，请重试');
                }
              }).fail(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                $.niuNotice('设置失败，请重试');
              });
            };

        // 验证群名称是否为空
        $.validator.addMethod('titleNull', function(value, element) {
          var titleVal = $.trim(value),
              pass = true;

          if(titleVal.length <= 0) {
            pass = false;
          }

          return pass;
        }, '<i class="fa fa-times"></i>直播群名称不能为空');

        $.formValidate($('#qn-pager-settings-room-basic-form'), rules, messages, submit);
      });

      // 取消编辑
      $(document).on('click', '#cancel-room-info-edit-basic', function() {
        var $el = $(this);

        $el.closest('.row').find('.col-xs-8').find('.qn-form-control').addClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-control-static').removeClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-form-group-tip').remove();

        $el.siblings('#room-info-edit-basic-info').removeClass('hide');
        $el.siblings('#submit-room-info-edit-basic').remove();
        $el.remove();
      });
    },

    /* 操作群公告设置 */
    handleRoomNotice: function() {
      $(document).on('click', '#room-info-edit-notice-btn', function() {
        var $el = $(this),
            $submitBtn = $('<button type="submit" id="submit-room-info-edit-notice" class="qn-btn primary">保存</button>'),
            $cancelBtn = $('<a href="javascript:" id="cancel-room-info-edit-notice" class="qn-btn">取消</a>');

        $el.after($submitBtn);
        $el.after($cancelBtn);
        $el.addClass('hide');

        $el.closest('.row').find('.col-xs-8').find('.qn-form-control').removeClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-control-static').addClass('hide');

        var rules = {
              qn_pager_room_info_announcement_input: {
                maxlength: 500
              }
            },
            messages = {
              qn_pager_room_info_announcement_input: {
                maxlength: $.validator.format('<i class="fa fa-times"></i>直播群公告不能超过{0}个字符')
              }
            },
            submit = function(form) {
              var $form = $(form),
                  $submitBtn = $('#submit-room-info-edit-notice'),
                  url = $form.attr('action'),
                  type = $form.attr('method').toUpperCase(),
                  formData = $.serializeFormObject(form),
                  params = {},
                  param = {},
                  announcement = {},
                  flag = 1 << 7;

              announcement['type'] = 0;
              announcement['announcement'] = formData.qn_pager_room_info_announcement_input;

              param['announcement'] = announcement;
              param['flag'] = flag;
              param['groupId'] = $('#logout-live-room-btn').data('id');

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
                  $submitBtn.html('设置中…');
                }
              }).done(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                if(data.code === 0) {
                  var newAnnouncement = $('#qn-pager-room-info-announcement-input').val();

                  newAnnouncement = $.filterScriptLabel(newAnnouncement);

                  newAnnouncement = newAnnouncement.replace(/\n/g, '<br>');

                  $('#qn-pager-room-info-announcement-input').siblings('.qn-control-static').html(newAnnouncement);
                  $('#qn-pager-room-info-announcement-input').siblings('.qn-control-static').removeClass('hide');
                  $('#qn-pager-room-info-announcement-input').addClass('hide');


                  $('#submit-room-info-edit-notice').remove();
                  $('#cancel-room-info-edit-notice').remove();
                  $('#room-info-edit-notice-btn').removeClass('hide');
                } else {
                  $.niuNotice('设置失败，请重试');
                }
              }).fail(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                $.niuNotice('设置失败，请重试');
              });
            };

        $.formValidate($('#qn-pager-settings-room-announcement-form'), rules, messages, submit);
      });

      // 取消编辑
      $(document).on('click', '#cancel-room-info-edit-notice', function() {
        var $el = $(this);

        $el.closest('.row').find('.col-xs-8').find('.qn-form-control').addClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-control-static').removeClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-form-group-tip').remove();

        $el.siblings('#room-info-edit-notice-btn').removeClass('hide');
        $el.siblings('#submit-room-info-edit-notice').remove();
        $el.remove();
      });
    },

    /* 操作群身份验证设置 */
    handleRoomAuthentication: function() {
      $(document).on('click', '#room-info-edit-authentication-btn', function() {
        var $el = $(this),
            $submitBtn = $('<button type="submit" id="submit-room-info-edit-authentication" class="qn-btn primary">保存</button>'),
            $cancelBtn = $('<a href="javascript:" id="cancel-room-info-edit-authentication" class="qn-btn">取消</a>');

        $el.after($submitBtn);
        $el.after($cancelBtn);
        $el.addClass('hide');

        $el.closest('.row').find('.col-xs-8').find('.qn-form-group').addClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.special').removeClass('hide');

        var rules = {
              need_verify: {
                required: true
              }
            },
            messages = {
              need_verify: {
                required: '<i class="fa fa-times"></i>群身份验证不能为空'
              }
            },
            submit = function(form) {
               var $form = $(form),
                  $submitBtn = $('#submit-room-info-edit-notice'),
                  url = $form.attr('action'),
                  type = $form.attr('method').toUpperCase(),
                  formData = $.serializeFormObject(form),
                  params = {},
                  param = {},
                  flag = 1 << 6;

              param['needVerify'] = formData.need_verify;
              param['flag'] = flag;
              param['groupId'] = $('#logout-live-room-btn').data('id');

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
                  $submitBtn.html('设置中…');
                }
              }).done(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                if(data.code === 0) {
                  if(formData.need_verify === 'Y') {
                    $('#qn-pager-room-info-need-verify-html').html('需我验证通过才能加入');
                  } else {
                    $('#qn-pager-room-info-need-verify-html').html('所有客户可加入');
                  }

                  $('#qn-pager-room-info-need-verify-y').closest('.qn-form-group').addClass('hide');
                  $('#qn-pager-room-info-need-verify-y').closest('.qn-form-group').siblings('.qn-form-group').removeClass('hide');

                  $('#submit-room-info-edit-authentication').remove();
                  $('#cancel-room-info-edit-authentication').remove();
                  $('#room-info-edit-authentication-btn').removeClass('hide');
                } else {
                  $.niuNotice('设置失败，请重试');
                }
              }).fail(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                $.niuNotice('设置失败，请重试');
              });
            };

        $.formValidate($('#qn-pager-settings-room-authentication-form'), rules, messages, submit);
      });

      // 取消编辑
      $(document).on('click', '#cancel-room-info-edit-authentication', function() {
        var $el = $(this);

        $el.closest('.row').find('.col-xs-8').find('.qn-form-group').removeClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.special').addClass('hide');
        $el.closest('.row').find('.col-xs-8').find('.qn-form-group-tip').remove();

        $el.siblings('#room-info-edit-authentication-btn').removeClass('hide');
        $el.siblings('#submit-room-info-edit-authentication').remove();
        $el.remove();
      });
    },

    /* 操作收费设置按钮 */
    handleRoomPrice: function() {
      $(document).on('click', '#room-info-edit-price', function() {
        var $editPriceInputs = $('<div class="row">' +
                        '<form id="qn-pager-settings-room-price-form" action="/live_room/upload" method="post">' +
                        '<div class="col-xs-7">' +

                        '<div class="qn-form-group">' +
                        '<label class="qn-control-label">价格<i>*</i></label>' +
                        '<div class="qn-form-group-box">' +
                        '<input type="text" id="qn-pager-room-settings-price-input" name="qn_pager_room_settings_price_input" class="qn-form-control">' +
                        '</div>' +
                        '</div>' +

                        '<div class="qn-form-group">' +
                        '<label class="qn-control-label">优惠价</label>' +
                        '<div class="qn-form-group-box">' +
                        '<input type="text" id="qn-pager-room-settings-sales-price-input" name="qn_pager_room_settings_sales_price_input" class="qn-form-control">' +
                        '</div>' +
                        '</div>' +

                        '<div class="qn-form-group">' +
                        '<label class="qn-control-label">VIP优惠价</label>' +
                        '<div class="qn-form-group-box">' +
                        '<input type="text" id="qn-pager-room-settings-vip-price-input" name="qn_pager_room_settings_vip_price_input" class="qn-form-control">' +
                        '</div>' +
                        '</div>' +

                        '</div>' +

                        '<div class="col-xs-5 text-right">' +
                        '<a class="qn-btn" id="cancel-room-info-edit-price">取消</a>' +
                        '<button type="submit" id="submit-room-info-edit-price" class="qn-btn primary">保存</button>' +
                        '</div>' +
                        '</form>' +
                        '</div>'),
            $el = $(this),
            price = $el.data('price'),
            salesPrice = $el.data('sales_price'),
            vipPrice = $el.data('vip_price');

        $editPriceInputs.find('#qn-pager-room-settings-price-input').val(price);

        if(salesPrice) {
          $editPriceInputs.find('#qn-pager-room-settings-sales-price-input').val(salesPrice);
        }

        if(vipPrice) {
          $editPriceInputs.find('#qn-pager-room-settings-vip-price-input').val(vipPrice);
        }

        $el.closest('.row').before($editPriceInputs);
        $el.closest('.row').addClass('hide');

        var rules = {
              qn_pager_room_settings_price_input: {
                required: true,
                min: 1,
                max: 3000
              },
              qn_pager_room_settings_sales_price_input: {
                min: 1,
                max: 3000,
                relativePrice: true
              },
              qn_pager_room_settings_vip_price_input: {
                min: 1,
                max: 3000,
                relativePrice: true
              }
            },
            messages = {
              qn_pager_room_settings_price_input: {
                required: '<i class="fa fa-times"></i>收费群价格不能为空',
                min: $.validator.format('<i class="fa fa-times"></i>金额不能少于{0}元'),
                max: $.validator.format('<i class="fa fa-times"></i>金额不能大于{0}元')
              },
              qn_pager_room_settings_sales_price_input: {
                min: $.validator.format('<i class="fa fa-times"></i>金额不能少于{0}元'),
                max: $.validator.format('<i class="fa fa-times"></i>金额不能大于{0}元')
              },
              qn_pager_room_settings_vip_price_input: {
                min: $.validator.format('<i class="fa fa-times"></i>金额不能少于{0}元'),
                max: $.validator.format('<i class="fa fa-times"></i>金额不能大于{0}元')
              }
            },
            submit = function(form) {
              var $submitBtn = $('#submit-room-info-edit-price'),
                  $form = $(form),
                  url = $form.attr('action'),
                  type = $form.attr('method').toUpperCase(),
                  formData = $.serializeFormObject(form),
                  params = {},
                  param = {},
                  flag = 1 << 5,
                  charge = {};

              charge['price'] = $('#qn-pager-room-settings-price-input').val();
              charge['salesPrice'] = $('#qn-pager-room-settings-sales-price-input').val();
              charge['vipPrice'] = $('#qn-pager-room-settings-vip-price-input').val();

              param['flag'] = flag;
              param['charge'] = charge;
              param['groupId'] = $('#logout-live-room-btn').data('id');

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
                  $submitBtn.html('设置中…');
                }
              }).done(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                if(data.code === 0) {
                  $('#room-info-edit-price').data('price', charge['price']);
                  $('#room-info-edit-price').data('sales_price', charge['salesPrice']);
                  $('#room-info-edit-price').data('vip_price', charge['vipPrice']);

                  var uploadHtml = '原价：' + charge['price'] + '元/月';

                  if(charge['salesPrice'] !== '') {
                    uploadHtml += '，优惠价：' + charge['salesPrice'] + '元/月';
                  }

                  if(charge['vipPrice'] !== '') {
                    uploadHtml += '，VIP优惠价：' + charge['vipPrice'] + '元/月';
                  }

                  $submitBtn.closest('.row').siblings('.row').find('.col-xs-8').html(uploadHtml);
                  $submitBtn.closest('.row').siblings('.row').removeClass('hide');
                  $submitBtn.closest('.row').remove();
                } else {
                  $.niuNotice('设置失败，请重试');
                }
              }).fail(function(data) {
                $submitBtn.removeAttr('disabled');
                $submitBtn.html('保存');

                $.niuNotice('设置失败，请重试');
              });
            };

        // 比较价格与优惠价格
        $.validator.addMethod('relativePrice', function(value, element) {
          var priceVal = parseInt($.trim($('#qn-pager-room-settings-price-input').val())),
              pass = true;

          value = parseInt(value);

          if(value >= priceVal) {
            pass = false;
          }

          return pass;
        }, '<i class="fa fa-times"></i>该价格不能大于原价');

        $.formValidate($('#qn-pager-settings-room-price-form'), rules, messages, submit);
      });

      // 取消价格设置
      $(document).on('click', '#cancel-room-info-edit-price', function() {
        var $el = $(this);

        $el.closest('.row').siblings('.row').removeClass('hide');
        $el.closest('.row').remove();
      });
    },

    /* 操作退出直播群按钮 */
    handleLogoutLiveRoom: function() {
      $('#logout-live-room-btn').click(function() {
        var $el = $(this),
            id = $el.data('id'),
            type = $el.data('type');

        if(type === 0) {
          $.niuConfirm('您将退出该群，退群不会通知群聊中其他成员', function() {
            SEMICOLON.manage.logoutLiveRoom($el, 0, id);
          });
        } else if(type === 1) {
          $.niuConfirm('是否确认解散该群组', function() {
            SEMICOLON.manage.logoutLiveRoom($el, 1, id);
          });
        }
      });
    },

    /*
     * 退出直播群
     * @$btn: 点击的按钮
     * @type: 类型， 0: 退出，1: 解散
     * @id: 要退出的群ID
     */
    logoutLiveRoom: function($btn, type, id) {
      var url,
          param = {},
          params = {};

      param['groupId'] = id;
      params['params'] = param;

      url = type === 0 ? '/live_room/quit' : '/live_room/dissolution';

      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(params),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function() {
          $btn.addClass('disabled');
          $btn.html('挥泪告别中…');
        }
      }).done(function(data) {
        if(data.code === 0) {
          // 删除联系列表，对话框
          SEMICOLON.chat.deleteMsgBadge(id);
          $('#qn-pager-recent-box').find('.contacts-item-' + id).remove();
          $('#qn-pager-contacts-box').find('.contacts-item-' + id).remove();

          var $prevEl = $('.qn-pager-chat-box').find('.qn-pager-chat-item-' + id).prev(),
              prevId = $prevEl.data('id');

          $('#qn-pager-recent-box').find('.contacts-item-' + prevId).addClass('active');
          $('#qn-pager-contacts-box').find('.contacts-item-' + prevId).addClass('active');
          $prevEl.addClass('active');

          $('.qn-pager-chat-box').find('.qn-pager-chat-item-' + id).remove();

          var returnBtnId = $('#qn-pager-title').find('.qn-pager-return-window').eq(0).data('id');

          SEMICOLON.manage.hiddenManageWindow('room-info', returnBtnId);

          // 如果是在直播间列表页解散群，则删除列表中的群
          if($('.live-room-item').length && type === 1) {
            $('.live-room-item').each(function() {
              if($(this).data('id') === id) {
                $(this).remove();
              }
            });
          }
        } else {
          $btn.removeClass('disabled');
          $.niuNotice(data.message);
        }
      }).fail(function(data) {
        $btn.removeClass('disabled');
        $.niuNotice('失败，请重试');
      });
    }
  };

  /*
   * 元素加载时执行
   * @init: 初始化方法
   * @scroll: 滚动条滚动时促发
   */
  SEMICOLON.documentOnReady = {
    init: function() {
      // 登录时才执行
      if(imId) {
        SEMICOLON.initialize.init();
        SEMICOLON.easemob.init();
        SEMICOLON.contacts.init();
        SEMICOLON.documentOnReady.scroll();
        SEMICOLON.chat.init();
        SEMICOLON.manage.init();
      }
    },

    scroll: function() {
      $('#qn-pager-contacts-box').scroll(function() {
        SEMICOLON.contacts.incrLoadContacts(this);
      });

      $('.qn-pager-add-member-contacts-list').scroll(function() {
        SEMICOLON.contacts.incrLoadContacts(this);
      });
    }
  };

  $(document).ready(SEMICOLON.documentOnReady.init);
});
