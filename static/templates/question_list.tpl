{{each qa}}
  <li data-aid="{{$value.aId}}" class="seo-questions-list-item">
    <dl>
      <dt>
        <i class="qn-font-icon info">问</i>
        {{ if $value.assetName }}
        <a href="/gupiao/{{$value.assetId}}" class="qn-stock-title-link">{{$value.assetName}}</a>
        {{ /if }}
        <a href="/wenda/{{$value.qId}}" title="{{$value.qContent}}" class="qn-post-title-link">{{$value.qContent}}</a>
      </dt>
      <dd>
        <i class="qn-font-icon primary">答</i>
        <p>{{$value.aContent}}</p>
        <a href="/wenda/{{$value.qId}}" title="{{$value.qContent}}" class="post-more">查看详情&nbsp;<i class="fa fa-angle-double-right"></i></a>
      </dd>
    </dl>
    <div class="post-meta clearfix">
      <div class="author">
        {{if $value.aIcon}}
        <img src="{{$value.aIcon}}" alt="{{$value.aName}}" >
        {{else}}
        <img src="/images/default_avatar_man.jpg" alt="{{$value.aName}}" >
        {{/if}}
        <a href="javascripts:" title="{{$value.aName}}">{{$value.aName}}</a> &nbsp;解答
      </div>
      <div class="date">{{ $value.aTime | dateFormate:'' }}</div>
    </div>
  </li>
{{/each}}