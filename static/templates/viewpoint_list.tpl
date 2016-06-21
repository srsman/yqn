{{each data}}
  <li data-vid="{{$value.viewpointId}}" class="seo-viewpoint-list-item viewpoint-item">
    <div class="seo-viewpoint-header clearfix">
        <div class="qn-avatar disable small">
          {{if $value.uImg}}
          <img src="{{$value.uImg}}" alt="{{$value.uName}}" >
          <div class="qn-vip"></div>
          {{else}}
          <img src="/images/default_avatar_man.jpg" alt="{{$value.uName}}" >
          <div class="qn-vip"></div>
          {{/if}}
        </div>
        <ul class="viewpoint-author-info">
          <li><a href="javascripts:" title="{{$value.uName}}">{{$value.uName}}</a></li>
          {{ if $value.adviserOrg }}
            <li>{{ $value.adviserOrg }}（{{$value.adviserType}}）</li>
          {{ else }}
            <li>{{$value.adviserType}}</li>
          {{ /if }}
        </ul>
    </div>
    <dl class="seo-viewpoint-main">
      <dt>
        <a href="/guandian/{{$value.viewpointId}}" title="{{$value.title}}" class="qn-post-title-link">{{$value.title}}</a>
      </dt>
      <dd>
        <p>{{$value.summary}}</p>
      </dd>
    </dl>
    <div class="seo-viewpoint-footer clearfix">
      <div class="date">{{ $value.viewpointTs | dateFormate:'' }}</div>
      {{if $value.stkLables}}
      <ul>
        <li>相关股票</li>
        {{each $value.stkLables}}
        <li><a href="/gupiao/{{$value.value}}" title="{{$value.name}}">{{$value.name}}</a></li>
        {{/each}}
      </ul>
      {{/if}}
      <span class="readed-times">阅读<i>{{$value.readNum}}</i></span>
    </div>
  </li>
{{/each}}

