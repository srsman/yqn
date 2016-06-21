<div class="msg-box custom {{if !url}} disable {{/if}}" {{if url}} data-url="{{url}}" {{/if}}>
  <span class="msg-arrow"><i></i><em></em></span>
  <div class="msg-custom-main">
    <h5>{{title}}</h5>
    <div class="msg-custom-content">
      <div class="custom-content-icon">
        <img src="{{icon}}" width="63" height="63">
      </div>
      <div class="custom-content">{{#content}}</div>
    </div>
  </div>
  {{if !url}}
    <div class="msg-custom-footer">暂时只能在一起牛APP中打开</div>
  {{/if}}
</div>
