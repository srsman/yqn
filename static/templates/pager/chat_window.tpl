<div class="qn-pager-chat-item qn-pager-chat-item-{{id}}" data-id="{{id}}" data-charge="{{charge}}" data-owner="{{owner}}" data-owner_imid="{{ownerImId}}">
  <div class="chat-header">
    <span class="chat-title">
      {{name}}

      {{if type == 'R' && charge == 'Y'}}
        <i>收费</i>
      {{/if}}
    </span>

    {{if type == 'R'}}
      {{include './chat_window_room_operate'}}
    {{/if}}
  </div>
  <div class="chat-main">
    {{if type == 'R'}}
      <a href="javascript:" class="btn-chat-more" data-id="{{id}}" data-type="G">点击查看更多</a>
    {{else}}
      <a href="javascript:" class="btn-chat-more" data-id="{{id}}" data-type="C">点击查看更多</a>
    {{/if}}
    <ul class="chat-content">
    </ul>
  </div>
  <div class="chat-footer">
    <ul class="chat-msg-input-toolbar">
      <!--<li>
        <a class="show-emotion-icon" href="javascript:">
          <i class="fa fa-smile-o"></i>
        </a>
        <div class="chat-msg-input-toolbar-box hide">
          <div class="content">
              <ul class="chat-emotion-ul"></ul>
              <div class="arrow-box"><i></i><em></em></div>
          </div>
        </div>
      </li>-->
      <!--<li>
        <a class="chat-img-msg-btn" href="javascript:">
          <i class="fa fa-picture-o"></i>
        </a>
      </li>-->
    </ul>
    <textarea class="chat-msg-input"></textarea>
    <div class="chat-msg-submit">
      <i>Ctrl&nbsp;+&nbsp;Enter换行</i>
      <a href="javascript:" class="qn-btn primary xs chat-msg-submit-btn disabled">发送</a>
    </div>
  </div>
</div>
