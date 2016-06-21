{{if owner == 1}}
  <ul class="chat-header-secondary">
    <li>
      <a href="javascript:" class="show-manage-btn" title="群成员管理" data-id="{{id}}" data-mark="member-list" data-owner="{{owner}}" data-charge="{{charge}}">
        <i class="fa fa-user-plus"></i>
      </a>
    </li>
    <li>
      <a href="javascript:" class="show-manage-btn" title="群信息设置" data-id="{{id}}" data-mark="room-info" data-owner="{{owner}}" data-charge="{{charge}}">
        <i class="fa fa-cog"></i>
      </a>
    </li>
  </ul>
{{else}}
  <ul class="chat-header-secondary">
    <li>
      <a href="javascript:" class="show-manage-btn" title="查看群信息" data-id="{{id}}" data-mark="room-info" data-owner="{{owner}}" data-charge="{{charge}}">
        <i class="fa fa-search"></i>
      </a>
    </li>
  </ul>
{{/if}}
