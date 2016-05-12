define([
  'jquery',
  'common'
], function($){
  'use strict';

  /* 接口 */
  var API = {
    list : '/question/question_list', // 列表
    answer : '/question/answer_action' //回答
  };

  /*
  * 最新拉取的问题ID
  */
  var moreQuestionId = null;

  /*
   * 广场问答，客户问答公用列表
   * @checkQuestionId: 初始化最后问题的ID
   * @listFeed: 请求列表
   * @questionHtml: 问题html
   * @answerHtml: 回答html
   * @evaluateHtml: 满意度html
   * @noQuestionHtml: 数据为空html
   * @scrollUpdate: 滚动加载更多
   * @rushAction: 抢答动作
   * @refuseAction: 拒绝抢答
   * @giveupAction: 放弃抢答
   * @answerAction: 提交回答
   * @textareaHeight: 输入框高度自适应
   */
  var SEMICOLON = {

    // 初始化最后问题的ID
    checkQuestionId: function() {
      var lastItem = $('.feed-item:last');
      moreQuestionId = lastItem.data('qid');
    },

    // 问题列表
    // @type: 广场问答传1，客户问答传2
    // @more: 增量加载传true，筛选不传
    listFeed: function(type, more) {

      var qStatus = $('#qStatusFilter > a.active').data('status'),
          params = {};

      if(type === 1){
        // 广场问答
        var isSatisfy = $('#isSatisfyFilter > a.active').data('satisfy');

        params['type'] = type;
        params['count'] = 10;

        if(qStatus !== 'undefined'){
          params['qStatus'] = qStatus;
        }

        if(qStatus === 2){
          if(isSatisfy !== 'undefined'){
            params['isSatisfy'] = isSatisfy;
          }
        }

        if(more){
          params['moreQId'] = moreQuestionId;
        }
      } else{
        // 客户问答
        params['type'] = type;
        params['count'] = 10;

        if(qStatus !== 'undefined'){
          params['qStatus'] = qStatus;
        }

        if(more){
          params['moreQId'] = moreQuestionId;
        }
      }

      $.niuAjax(API.list, params, function(data) {

        if(data.code === 0){
          if(typeof data.result !== "undefined" && typeof data.result.qa !== "undefined"){

            var qa = data.result.qa,
                _html = '';
            for(var i=0; i<qa.length; i++){
              _html += '<div data-qid="' + qa[i].qId + '" class="feed-item">';
              _html += SEMICOLON.questionHtml(qa[i]);
              _html += SEMICOLON.answerHtml(qa[i], type);
              _html += SEMICOLON.evaluateHtml(qa[i].isSatisfy);
              _html += '</div>';
            }

            if(more){
              $('#questionFeedWrap').append(_html);

              var count = $('#ajaxLoading').data('count');
              count += 1;

              $('#ajaxLoading').data('count', count);

              if(count >= 2){
                $('#ajaxLoading').html('点击加载更多');
              }

              if(data.result.qa.length < 10){
                $('#ajaxLoading').html('没有更多问题').data('over', 'Y');
              }
            } else{
              $('#questionFeedWrap').empty().append(_html);
              $('#ajaxLoading').data('count', 0);
              $('#ajaxLoading').addClass('hide');
              $('#ajaxLoading').html('没有更多问题').data('over', 'N');
              $('#ajaxLoading').html('<img src="/images/loading.gif">正在加载中，请稍候...');
            }

            //更新最后一个问题id
            moreQuestionId = qa[qa.length-1].qId;
          } else{
            if(more){
               $('#ajaxLoading').html('没有更多问题').data('over', 'Y');
            } else{
              $('#questionFeedWrap').empty().append(SEMICOLON.noQuestionHtml());
              $('#ajaxLoading').addClass('hide');
            }
          }
        } else{
          $.niuNotice(data.message);
        }

        // 解除重发锁定
        $('#ajaxLoading').data('active', 'N');
      });
    },

    // 问题html
    // 问题数组
    questionHtml: function(item) {

      var _html = [];

      //提问者信息
      _html.push('<div class="item-user qn-row">');
      _html.push('<div class="qn-avatar">');
      _html.push('<img src="' + $.checkUserIcon(item.qIcon, item.qGender) + '">');
      _html.push('</div>');
      _html.push('<div class="item-user-main">');
      _html.push('<div class="name">' + $.toEmoji(item.qName) + '</div>');
      _html.push('<div class="source">' + item.qAddr + '</div>');
      _html.push('</div>');
      _html.push('</div>');

      //问题内容
      _html.push('<div class="item-question qn-row">');
      _html.push('<i class="icon-question">问</i>');

      if(item.assetName){
        _html.push('<div class="item-question-about">');
        _html.push('<a href="javascript:;">' + item.assetName + '(' + item.assetId + ')</a>');

        if(item.price){
          _html.push('<span>成本价：' + item.price + '元</span>');
        }
        if(item.position){
          _html.push('<span>仓位：' + item.position + '</span>');
        }

        _html.push('</div>');
      }
      _html.push('<div class="item-question-content">' + $.toEmoji(item.qContent) + '</div>');
      _html.push('<div class="item-question-meta">');
      _html.push('<span class="date">' + $.timeDifference(item.qTime) + '</span>');
      _html.push('</div>');
      _html.push('</div>');

      return _html.join('');
    },

    // 回答html
    // @item: 数据数组
    // @type: 问答类型
    answerHtml: function(item, type) {

      var _html=[];

      switch(item.qStatus){
        case 0:
          _html.push('<div class="item-answer qn-row">');
          _html.push('<div class="item-answer-content">');
          _html.push('<div class="row">');
          _html.push('<div class="col-xs-12 text-right">');
          _html.push('<a class="qn-btn J-refuse" role="button">放弃抢答</a>');
          _html.push('<a class="qn-btn primary J-rush" role="button">立即抢答</a>');
          _html.push('</div>');
          _html.push('</div>');
          _html.push('</div>');
          _html.push('</div>');
          break;
        case 1:
          _html.push('<div class="item-answer qn-row">');
          _html.push('<div class="item-answer-content">');
          _html.push('<div class="row">');
          _html.push('<div class="col-xs-12">');
          _html.push('<textarea class="qn-form-control" placeholder="请输入您对问题的分析和建议"></textarea>');
          _html.push('</div>');
          _html.push('</div>');
          _html.push('<div class="row">');
          _html.push('<div class="col-xs-7 text-left">');

          if(item.timeLimit){
            _html.push('<div class="qn-alert info">');
            _html.push('<i class="fa fa-info"></i>若无法在' + $.formatDate(item.timeLimit, 'hh:mm') + '前进行解答，可以点击放弃。');
            _html.push('</div>');
          }

          _html.push('</div>');
          _html.push('<div class="col-xs-5 text-right">');

          if(type === 1){
            _html.push('<a class="qn-btn link J-giveup" role="button">放弃</a>');
          }

          _html.push('<a class="qn-btn primary J-submit" role="button">提交</a>');
          _html.push('</div>');
          _html.push('</div>');
          _html.push('</div>');
          _html.push('</div>');
          break;
        case 2:
          _html.push('<div class="item-answer qn-row">');
          _html.push('<i class="icon-answer">答</i>');
          _html.push('<div class="item-answer-content">' + $.toEmoji(item.aContent.strFilter()) + '</div>');
          _html.push('<div class="item-answer-meta">');
          _html.push('<span class="date">' + $.timeDifference(item.aTime) + '</span>');
          _html.push('</div>');
          _html.push('</div>');
          break;
        case 3:
          _html.push('<div class="item-answer qn-row">');
          _html.push('<div class="text-left">');
          _html.push('<div class="qn-alert warning">');
          _html.push('<i class="fa fa-info"></i>已放弃</div>');
          _html.push('</div>');
          _html.push('</div>');
          break;
        case 4:
          _html.push('<div class="item-answer qn-row">');
          _html.push('<div class="text-left">');
          _html.push('<div class="qn-alert warning">');
          _html.push('<i class="fa fa-info"></i>已超时</div>');
          _html.push('</div>');
          _html.push('</div>');
          break;
        default:
          _html.push('');
      }
      return _html.join('');
    },

    // 满意度html
    // @satisfy: 满意度值,0不满意，1满意，2未评价
    evaluateHtml: function(satisfy) {
      if(satisfy === 0){
        return '<div class="item-evaluate poor"></div>';
      } else if(satisfy === 1){
        return '<div class="item-evaluate good"></div>';
      } else{
        return '';
      }
    },

    // 数据为空html
    noQuestionHtml: function() {

      var qStatus = $('#qStatusFilter > a.active').data('status'),
          _html = [],
          text;

      switch(qStatus){
        case 0:
          text = '暂无待抢答问题！';
        break;
        case 1:
          text = '暂无待解答问题！';
        break;
        case 2:
          text = '您还没有回答问题！';
        break;
        case 3:
          text = '您还没有放弃问题！';
        break;
        case 4:
          text = '暂无超时问题！';
        break;
        default:
          text = '暂无问题！';
      }

      _html.push('<div class="qn-no-result"><ul>');
      _html.push('<li><img height="106" src="/images/list_null.png"></li>');
      _html.push('<li>' + text + '</li>');
      _html.push('</ul></div>');

      return _html.join('');
    },

    // 抢答动作，此方法有问题
    rushAction: function() {

      $(document).on('click', '.J-rush', function(e){
        e.preventDefault();

        var ele = $(this),
            questionId = ele.parents('.feed-item').eq(0).data('qid'),
            params = {};

        if(ele.hasClass('locked')){
          return ;
        }
        ele.addClass('locked');
        ele.addClass('disabled').html('抢答中...');

        params['qId'] = questionId;
        params['action'] = 'rush';

        $.niuAjax(API.answer, params, function(data) {

          var _html = [];

          if(data.code === 0){
            _html.push('<div class="row">');
            _html.push('<div class="col-xs-12">');
            _html.push('<textarea class="qn-form-control" placeholder="请输入您对问题的分析和建议"></textarea>');
            _html.push('</div>');
            _html.push('</div>');
            _html.push('<div class="row">');
            _html.push('<div class="col-xs-7 text-left">');

            if(data.result.timeLimit){
              _html.push('<div class="qn-alert info">');
              _html.push('<i class="fa fa-info"></i>若无法在' + $.formatDate(data.result.timeLimit, 'hh:mm') + '前进行解答，可以点击放弃。');
              _html.push('</div>');
            }

            _html.push('</div>');
            _html.push('<div class="col-xs-5 text-right">');
            _html.push('<a class="qn-btn link J-giveup" role="button">放弃</a>');
            _html.push('<a class="qn-btn primary J-submit" role="button">提交</a>');
            _html.push('</div>');
            _html.push('</div>');
          } else{
            _html.push('<div class="row">');
            _html.push('<div class="col-xs-7 text-left">');
            _html.push('<div class="qn-alert warning">');
            _html.push('<i class="fa fa-info"></i>' + data.message + '</div>');
            _html.push('</div>');
            _html.push('<div class="col-xs-5 text-right">');
            _html.push('<a role="button" class="qn-btn disabled">放弃抢答</a>');
            _html.push('<a role="button" class="qn-btn disabled">立即抢答</a>');
            _html.push('</div>');
            _html.push('</div>');

            ele.removeClass('disabled').html('立即抢答');
            ele.removeClass('locked');
          }

          ele.parent().parent().parent().empty().append(_html.join(''));
        });
      });
    },

    // 拒绝抢答
    refuseAction: function() {

      $(document).on('click', '.J-refuse', function(e){
        e.preventDefault();

        var ele = $(this),
            questionId = ele.parents('.feed-item').eq(0).data('qid'),
            params = {};

        if(ele.hasClass('locked')){
          return;
        }
        ele.addClass('locked');

        params['qId'] = questionId;
        params['action'] = 'refuse';

        $.niuAjax(API.answer, params, function(data) {

          var _html = [];

          if(data.code === 0){
            _html.push('<div class="row">');
            _html.push('<div class="col-xs-7 text-left">');
            _html.push('<div class="qn-alert warning">');
            _html.push('<i class="fa fa-info"></i>已拒绝</div>');
            _html.push('</div>');
            _html.push('<div class="col-xs-5 text-right">');
            _html.push('<a role="button" class="qn-btn disabled">放弃抢答</a>');
            _html.push('<a role="button" class="qn-btn disabled">立即抢答</a>');
            _html.push('</div>');
            _html.push('</div>');
          } else{
            $.niuAlert(data.message);
            ele.removeClass('locked');
          }
          ele.parent().parent().parent().empty().append(_html.join(''));
        });
      });
    },

    // 放弃抢答
    giveupAction: function() {

      $(document).on('click', '.J-giveup', function(e){
        e.preventDefault();
        var ele = $(this);

        $.niuConfirm('确定要放弃抢答此问题吗？', function(){

          var questionId = ele.parents('.feed-item').eq(0).data('qid'),
              params = {};

          params['qId'] = questionId;
          params['action'] = 'giveup';

          $.niuAjax(API.answer, params, function(data) {

            if(data.code === 0){
              var _html = [];
              _html.push('<div class="text-left">');
              _html.push('<div class="qn-alert warning">');
              _html.push('<i class="fa fa-info"></i>已放弃</div>');
              _html.push('</div>');

              ele.parent().parent().parent().empty().append(_html.join(''));
            } else{
              $.niuAlert(data.message);
            }
          });
        });
      });
    },

    // 提交回答
    // @callback:提交成功后执行函数
    answerAction: function(callback) {

      $(document).on('click', '.J-submit', function(e){
        e.preventDefault();

        var ele = $(this),
            questionId = ele.parents('.feed-item').eq(0).data('qid'),
            contentBox = ele.parents('.feed-item').eq(0).find('textarea').eq(0),
            content = $.trim(contentBox.val().strFilter()),
            params = {};

        if(ele.hasClass('locked')){
          return;
        }
        ele.addClass('locked');

        ele.addClass('disabled').html('提交中...');

        params['qId'] = questionId;
        params['action'] = 'answer';
        params['content'] = content;

        $.niuAjax(API.answer, params, function(data) {

          if(data.code === 0){
            var _html = [],
                date = new Date();

            _html.push('<i class="icon-answer">答</i>');
            _html.push('<div class="item-answer-content">' + content.replace(/\n/g,"<br/>") + '</div>');
            _html.push('<div class="item-answer-meta">');
            _html.push('<span class="date">' + $.timeDifference(date) + '</span>');
            _html.push('</div>');

            ele.parent().parent().parent().empty().append(_html.join(''));

            callback();
          } else{
            ele.parent().siblings('.text-left').html('<div class="qn-alert warning"><i class="fa fa-info"></i>' + data.message + '</div>');
            contentBox.focus();
            ele.removeClass('locked disabled').html('提交');
          }
        });
      });
    },

    // 滚动加载更多
    scrollLoadMore: function(type) {

      $(window).scroll(function() {
        var scrollTop = $(window).scrollTop(),
            scrollHeight = $(document).height(),
            windowHeight = $(window).height(),
            loadCount = $('#ajaxLoading').data('count'),
            over = $('#ajaxLoading').data('over'),
            active = $('#ajaxLoading').data('active'),
            items = $('.feed-item');

        //- 如果不为空，并且滚动达到高度时拉新
        if(((scrollTop + windowHeight) === scrollHeight) && items.length > 0){

          if(loadCount < 2 && over !== 'Y'){
            $('#ajaxLoading').removeClass('hide');

            // 防止重发
            if(active === 'Y'){
              return ;
            }

            setTimeout(function() {
              SEMICOLON.listFeed(type, true);
            }, 250);

            $('#ajaxLoading').data('active', 'Y');
          }
        }
      });
    },

    // 点击加载更多
    clickLoadMore: function(type) {

      $(document).on('click', '#ajaxLoading', function() {

        var over = $(this).data('over'),
            active = $('#ajaxLoading').data('active');

        if(over === 'Y' || active === 'Y'){
          return ;
        }

        $('#ajaxLoading').html('<img src="/images/loading.gif">正在加载中，请稍候...');
        setTimeout(function() {
          SEMICOLON.listFeed(type, true);
        }, 250);

        $('#ajaxLoading').data('active', 'Y');
      });
    },

    // 输入框高度自适应
    textareaHeight: function() {
      $(document).on('keyup', 'textarea.qn-form-control', function() {
        var textHeight = this.scrollHeight + 2;
        $(this).css('height', textHeight + 'px');
      });
    }
  };

  return SEMICOLON;
});