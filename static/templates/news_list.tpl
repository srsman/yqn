{{each data}}
  <li class="seo-news-list-item item" data-mid={{$value.artid}}>
    <dl>
      <dt>
        {{ if $value.url }}
          <h3 class="qn-post-title">{{$value.title}}</h3>
        {{ else }}
          <a href="/xinwen/gupiao/{{$value.artid}}" class="qn-post-title-link" title={{$value.title}}>{{$value.title}}</a>
        {{/if}}
      </dt>
      <dd>
        {{ if $value.content }}
          <p>{{$value.content}}</p>
        {{ else if $value.url }}
          <p> 公告文件：<a href="{{$value.url}}" title={{$value.title}} target='_blank'>{{$value.url}}</a></p>
        {{/if}}
          <div class="seo-news-meta">
            {{ if $value.url }}
              {{ $value.date | dateFormate1:'yyyy-MM-dd' }}
            {{ else }}
              {{ $value.date | dateFormate:'' }}
            {{ /if }}

            {{ if $value.media }}
              <i>{{$value.media}}</i>
            {{/if}}
          </div>
      </dd>
    </dl>
  </li>
{{/each}}
