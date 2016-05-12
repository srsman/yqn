<div class="qn-pager-contacts-group {{if open == 1}} open {{/if}}" data-type="{{type}}" data-use="{{use}}" data-version="{{version}}" data-been="{{been}}" {{if count}} data-count="{{count}}" {{/if}} {{if id}} data-id="{{id}}" {{/if}}>
  <div class="group-title">
    {{if open == 1}}
      <i class="fa fa-caret-right"></i>
    {{else}}
      <i class="fa fa-caret-down"></i>
    {{/if}}

    {{#name}}
  </div>
  <ul class="qn-pager-contacts-list">
  </ul>
</div>
