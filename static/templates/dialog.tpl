<div class="qn-seo-shadow" ></div>
<div class="qn-seo-dialog adviser-dialog" >
  <i id="dialog-close" class="dialog-close"></i>
  <h2>向TA提问</h2>
  <div class="dialog-content">
    <div class="dialog-content-top">
      <div class="qn-avatar-info">
        <div class="qn-avatar disable">
            {{ if img }}
              <img src="{{img}}" alt="个人头像">
            {{ else }}
              <img src="/images/default_avatar_man.jpg" alt="个人头像">
            {{ /if }}
            <div class="qn-vip"></div>
        </div>
        <ul>
          <li>{{name}}</li>
          {{if orgName }}
          <li>{{orgName}}（{{adviserName}}）</li>
          {{else}}
          <li>{{adviserName}}</li>
          {{/if}}
        </ul>
      </div>
      <dl class="skilled-area">
        {{if fields && fields.length > 0}}
          <dt>擅长领域</dt>
          <dd>
          {{ each fields }}
          {{$value}}&nbsp;
          {{ /each }}
          </dd>
        {{/if}}
      </dl>
    </div>
    <div class="dialog-content-bottom">
      <div class="dialog-qrcode"></div>
      <p>微信扫描{{name}}的二维码名片<br>免费体验TA更多服务</p>
    </div>
  </div>
</div>
