/*
 * 齐牛官网手机适配版
 * @authors L.H.J (544531333@qq.com)
 * @date    2015-06-17 10:15:54
 */

var $ = window.$;
var IScroll = window.IScroll;
$(document).ready(function() {

	//百度统计
	var _hmt = _hmt || [];
	(function() {
	  var hm = document.createElement("script");
	  hm.src = "//hm.baidu.com/hm.js?794218b4f894eb9492cd450fcfa7ef75";
	  var s = document.getElementsByTagName("script")[0];
	  s.parentNode.insertBefore(hm, s);
	})();

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

	/*通用变量定义*/
	var myEvent = {click: ('ontouchstart' in window)?'touchstart':'click' };
	var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
	var ua = window.navigator.userAgent.toLowerCase();
	var isAndroid = /android/i.test(ua);
	var isIOS = /iphone|ipad|ipod/i.test(ua);

	//px转换为rem
	$(function() {
		var setPageSize = function() {
			var _doe = document.documentElement;
			var viewWidth = _doe.clientWidth;
			viewWidth = viewWidth >= 640 ? 640 : viewWidth;

			_doe.style.fontSize = (viewWidth / 3.2) + 'px';

		};
		// setPageSize();
		$(window).on(resizeEvt,setPageSize);
	});

	/*给body绑定触摸事件，用active伪类模拟hover方法*/
	$("body").bind("touchstart",function() {
	});

	//导航菜单
	$(function() {

		var $navMenuBtn = $(".nav-menu-btn");
		var $navMenu = $(".nav-menu");
		var $header = $("header");
		var $page = $(".page");
		var $jobTabs = $("#job-lists-tabs");
		var hdHeight = $header.outerHeight();
		var initTop = 0;

		//导航菜单显隐
		$navMenuBtn.bind("click",function() {
			if ( !$(this).hasClass("show") ) {
				$(this).addClass("show");
				$navMenu.slideDown();
			} else {
				$(this).removeClass("show");
				$navMenu.slideUp();
			}
		});

		//顶部导航向下滑动隐藏，向上滑动出现
		$(window).scroll(function() {

			var scrollTop =  doms().top;

			if ( scrollTop < hdHeight ) {
				$header.addClass("show");
			} else {
				if ( ( scrollTop > initTop ) ) {
					$header.removeClass("show");
					$header.addClass("hide");

					$navMenuBtn.removeClass("show");
					$navMenu.slideUp();
				} else {
					$header.removeClass("hide");
					$header.addClass("show");
				}
			}

			initTop = scrollTop;

		});

	});

	//返回顶部
	$(function(){

		$(document).on(myEvent.click,".goto-top",function() {
			$("html,body").animate({ scrollTop: 0}, 100);
		});

		$(window).scroll(function() {
			var $gotoTop = $(".goto-top");
			if( doms().top > 200 ) {
				$gotoTop.show();
			} else {
				$gotoTop.hide();
			}
		});

	});

	//首页banner轮播
	$(function() {
		var $banner = $("#banner");
		if ( $banner.length > 0) {
			$banner.touchsilder({
				ctrs: true,
				interval: 10000,
				autoPlay: true
			});
		}
	});

	//下载页banner动画
	$(function() {
		var $ddLogo = $("#download-logo");
		if ( $ddLogo.length > 0) {

			$ddLogo.css({"top":"-0.34rem"});
			$ddLogo.animate({'top': '0.34rem'},{duration:700,easing:'easeInSine'});

		}
	});

	//下载页根据浏览器显示下载内容
	$(function() {
		if (isAndroid) {
			$("#version-android").show();
		} else if (isIOS) {
			$("#version-iphone").show();
		} else {
			$("#version-android").show();
		}

	});

	//职位列表
	$(function() {
		var $jobLists = $(".job-lists");
		if ( $jobLists.length > 0 ) {
			var $jobLi = $jobLists.find("li");
			var $jobTabItem = $jobLists.find(".job-tab-item");
			var $jobConItem = $(".job-con-item");
			var listW;
			var cdScroll;

			var setWidth = function() {
				listW = 1;
				for(var i = 0; i < $jobLi.length; i++) {
					listW += Math.ceil($jobLi.eq(i).outerWidth(true));
					$jobLists.css({"width":listW});
				}
			};

			setWidth();
			$(window).on(resizeEvt,setWidth);

			$jobTabItem.each(function(index,ele) {
				$(ele).bind("click",function() {
					$jobTabItem.removeClass("cur");
					$(this).addClass("cur");
					$jobConItem.hide().eq(index).show();
				});
			});

			//列表滑动
			cdScroll = new IScroll("#job-lists-wrap", {
				scrollY: false,
				scrollX: true,
				mouseWheel: false,
				preventDefault: true,
				preventDefaultException: { tagName: /^(LI|A)$/ }
			});

		}

	});

});