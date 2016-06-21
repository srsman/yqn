{{if type != 'E' && type != 'N'}}
  <li class="contacts-item contacts-item-{{imId}} {{if type == 'Q'}} contacts-item-query {{/if}} {{if inGroup == 0}} add-member {{else if inGroup == 1}} add-member in-group {{/if}}" data-imid="{{imId}}" data-uid="{{uId}}" data-type="{{type}}" {{if type == 'R'}} data-charge="{{charge}}" data-owner="{{owner}}" data-owner_imid="{{ownerImId}}" {{/if}}>
    <a href="javascript:">
      <div class="qn-avatar">
        <img src="{{icon}}" width="36" height="36">
      </div>
      <h5 class="contacts-title">{{name}}</h5>

      {{if inGroup == 0}}
        <i class="fa fa-plus"></i>
      {{else if inGroup == 1}}
        <i class="fa fa-check"></i>
      {{/if}}
    </a>
  </li>
{{else}}
  <li class="contacts-item error">
    {{if type == 'E'}}
      加载失败，<a href="javascript:">点击重试</a>
    {{else if type == 'N'}}
      没有结果
    {{/if}}
  </li>
{{/if}}
