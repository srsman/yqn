(function($) {

	$.fn.touchsilder = function(options) {

		options = $.extend({
			ctrls: true,
			interval: 5000,
			autoPlay: true
		},options || {});

		return this.each(function() {

			var _this = this;
			var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
			var startX;
			var lenX;
			var idx = 1;
			var ctrls = options.ctrls;
			var interval = options.interval;
			var autoPlay = options.autoPlay;
			var timer;

			var $silder = $(this);
			var $box = $silder.find(".silder-box");
			var $oList = $box.find("li");

			var oLen = $oList.length;

			//获取dom属性
			var doms = function() {
				var _dd = document.documentElement;
				var _db = document.body;
				var _dom = _dd || _db;
				return{
					width:  Math.max(_dom.clientWidth, _dom.scrollWidth),		// 页面宽度
					height: Math.max(_dom.clientHeight, _dom.scrollHeight),	// 页面长度
					left: Math.max(_dd.scrollLeft, _db.scrollLeft),			// 被滚动条卷去的文档宽度
					top: Math.max(_dd.scrollTop, _db.scrollTop),				// 被滚动条卷去的文档高度
					viewHeight: _dom.clientHeight,
					viewWidth: _dom.clientWidth
				};
			};

			//若silder数量小于，则返回
			if (oLen < 2) {
				return;
			}

			//silder添加前后节点，以便循环
			$box.append($oList.eq(0).clone());
			$oList.eq(oLen-1).clone().insertBefore($box.find("li").eq(0));

			//添加数量小圆点
			if (ctrls) {
				var _ctrlTmp = [];
				_ctrlTmp.push('<ul class="ctrls">');
				for( var i = 1; i <= oLen; i++ ) {
					var _ctrlItem;
					if (i === 1) {
						_ctrlItem = "<li class='cur'>";
					} else {
						_ctrlItem = "<li>";
					}
					_ctrlTmp.push(_ctrlItem);
					_ctrlTmp.push('</li>');
				}
				_ctrlTmp.push('</ul>');
				$silder.append(_ctrlTmp.join(''));
			}

			//获取dom操作后的对象
			var $cList = $box.find("li");
			var $ctrls = $silder.find(".ctrls li");
			var oListW;
			var cLen;

			function setWidth() {
				oListW = $(window).width();
				oListW = oListW > 640 ? 640 : oListW;
				cLen = $cList.length;

				$silder.css("width",oListW);
				$cList.width(oListW);
				$box.width(oListW*cLen);
				$box.css("-webkit-transition","left 0s ease");
				$box.css("left",-oListW);
			}

			setWidth();
			$(window).bind(resizeEvt, setWidth);

			$box.css("position","relative");

			//滑动事件
			$silder.bind("touchstart",function(e){

				/*阻止默认事件*/
				// e.preventDefault();

				stop();
				startX = 0;
				lenX = 0;
				/*获取滑动距离*/
				startX = e.originalEvent.targetTouches[0].pageX;

			}).bind("touchmove",function(e){

				/*计算滑动距离*/
				lenX = e.originalEvent.targetTouches[0].clientX - startX;
				$box.css("left", (-oListW*idx + lenX) );

			}).bind("touchend",function(e){

				if(Math.abs(lenX)>=100){
					if(lenX<0){
						goNext();
					}else{
						goPrev();
					}
				}else{
					$box.css("left",-oListW*idx);
				}

				play();

			});

			//前一个滑动
			function goPrev() {
				idx--;
				$box.css("-webkit-transition","left 0.4s ease");
				$box.css("left",-oListW*idx);
				/*去掉控制按钮样式*/
				$ctrls.removeClass("cur");
				$ctrls.eq(idx-1).addClass("cur");

				if(idx<=0){
					setTimeout(function(){
						$box.css("-webkit-transition","left 0s ease");
						$box.css("left",-oListW*oLen);
					},400);
					idx = oLen;
				}
			}

			//后一个滑动
			function goNext() {
				idx++;
				$box.css("-webkit-transition","left 0.4s ease");
				$box.css("left",-oListW*idx);
				/*控制按钮*/
				$ctrls.removeClass("cur");
				$ctrls.eq(idx-1).addClass("cur");

				if( (idx >= (oLen + 1)) ){
					/*移动完*/
					setTimeout(function(){
						$box.css("-webkit-transition","left 0s ease");
						$box.css("left",-oListW);
					},400);
					idx = 1;
					$ctrls.removeClass("cur");
					$ctrls.eq(idx-1).addClass("cur");
				}
			}

			//启动滑动
			function play() {
				if (autoPlay) {
					timer = setInterval(function() {

						goNext();

					},interval);
				}
			}

			//暂停
			function stop() {
				clearInterval(timer);
			}

			//是否自动滑动
			play();

			//第一屏动画
			function firstBAnimate() {
				var $bBg1 = $("#b-bg-1");
				var $downloadWrap = $("#download-btn-wrap");
				$bBg1.css({"top":"-0.5rem"});
				$bBg1.animate({'top': '0.47rem'},{duration:700,easing:'easeInSine'});
				$downloadWrap.css({"bottom":"-0.7rem"});
				$downloadWrap.animate({'bottom': '0.7rem'},{duration:700,easing:'easeInSine'});
			}

			firstBAnimate();

		});

	};

})(jQuery);
