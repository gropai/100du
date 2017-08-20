import '../css/styles.css';

//定义通用工具方法
var Utils = (function(){
	//获取绝对位置
	function getPos(obj){
		var pos = {'left':0, 'top':0};
		while(obj){
			pos.left += obj.offsetLeft;
			pos.top += obj.offsetTop;
			obj = obj.offsetParent;
		}
		return pos;
	}

	//格式化时间
	function formatTime(t){
		t = Math.floor(t);
		var min = Math.floor(t/60);
		var sec = t % 60;
		return twoDigit(min) + ":" + twoDigit(sec);
	}

	//确保数字保持两个数位
	function twoDigit(t){
		if(t<10){
			return '0' + t;
		}else{
			return '' + t;
		}
	}

	//物体震动
	function shake(obj,dir,amp,step,freq,endFn){
		clearInterval(obj.shakeTimer);
		var changes = [];
		var pos = parseInt(getStyle(obj,dir));
		var count = 0;
		for(var i= amp; i>0; i-=step){
			changes.push(i,-i);
		}
		changes.push(0);
		obj.shakeTimer = setInterval(function(){
			obj.style[dir] = pos + changes[count] + 'px';
			count++;
			if(count==changes.length){
				clearInterval(obj.shakeTimer);
				endFn && endFn();
			}
		},freq);
	}


	//物体移动
	function move(obj,dir,end,step,freq,endFn){
		clearInterval(obj.moveTimer);
		var pos = parseInt(getStyle(obj,dir));
		step = pos>end ? -step : step;
		if(end!==pos && step!==0){
			obj.moveTimer = setInterval(function(){
				pos += step;
				if(step>0&&pos>end || step<0&&pos<end){
					pos = end;
				}
				obj.style[dir] = pos + 'px';
				if(pos===end){
					clearInterval(obj.moveTimer);
					endFn && endFn();
				}
			},freq);
		}
	}

	//获取对象样式
	function getStyle(obj,style){
		return obj.currentStyle ? obj.currentStyle[style] : getComputedStyle(obj)[style];
	}

	//添加class
	function addClass(obj,name){
		var reg = new RegExp(name);
		if(!reg.test(obj.className)){
			obj.className += ' ' + name;
			obj.className = obj.className.replace(/^\s+|\s+$/g,'');
		}
	}

	//移除class
	function removeClass(obj,name){
		obj.className = obj.className.replace(new RegExp(name,'g'),'').replace(/^\s+|\s+$/,'');
	}

	//验证数组里面是否包含给定值
	function contains(arr,elem){
		var len = arr.length;
		for(var i=0; i<len; i++){
			if(arr[i]===elem){
				return true;
			}
		}
		return false;
	}

	return {
		getPos: getPos,
		formatTime: formatTime,
		twoDigit: twoDigit,
		shake: shake,
		move: move,
		getStyle: getStyle,
		addClass: addClass,
		removeClass: removeClass,
		contains: contains
	};
})();

var getPos = Utils.getPos,
	formatTime = Utils.formatTime,
	twoDigit = Utils.twoDigit,
	shake = Utils.shake,
	move = Utils.move,
	getStyle = Utils.getStyle,
	addClass = Utils.addClass,
	removeClass = Utils.removeClass,
	contains = Utils.contains;

//定义选项卡对象
var Tabs = (function(){
	function Tabs(id,name1,name2){
		this.tabs = document.getElementById(id).getElementsByClassName(name1)[0].getElementsByTagName('li');
		this.tabsItem = document.getElementById(id).getElementsByClassName(name2);
	}

	Tabs.prototype.init = function(){
		var _tabs = this.tabs;
		var _tabsItem = this.tabsItem;
		for(var i=0; i<_tabs.length; i++){
			_tabs[i].index = i;
			_tabs[i].onclick = function(){
				for(var i=0; i<_tabs.length; i++){
					removeClass(_tabs[i],'active');
					removeClass(_tabsItem[i],'active');
				}
				addClass(this,'active');
				addClass(_tabsItem[this.index],'active');
			};
		}
	};

	return Tabs;
})();

//定义与日期相关的方法
var Calendar = (function(){
	//获取本月天数
	function getCurrDays(date){
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		switch(month){
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				return 31;
			case 4:
			case 6:
			case 9:
			case 11:
				return 30;
			case 2:
				if(year%400==0){
					return 29;
				}else if(year%4==0 && year%100!=0){
					return 29;
				}else{
					return 28;
				}
		}
	}

	//获取上个月天数
	function getPrevDays(date){
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if(month==1){
			return 31;
		}else{
			return getCurrDays(new Date(year+'/'+(month-1)+'/1'));
		}
	}

	//确定给定日期对应星期几
	function getWeekday(date){
		switch(date.getDay()){
			case 0:
				return 'SUN';
			case 1:
				return 'MON';
			case 2:
				return 'TUE';
			case 3:
				return 'WED';
			case 4:
				return 'THU';
			case 5:
				return 'FRI';
			case 6:
				return 'SAT';
		}
	}

	//在补齐上个月的日期时，确定从几号开始补齐
	function getPrevStart(firstWeekday,prevMonDays){
		if(firstWeekday==0){	//如果本月1号是周日
			return prevMonDays - 6 + 1;
		}else if(firstWeekday==1){	//如果本月1号是周一，不需要在日历开头补齐上月天数
			return -1;   
		}else{	//其他情况
			return prevMonDays - firstWeekday + 2;
		}
	}

	//在日历中插入li
	function insertLi(parent,name,start,end){
		for(var i=start; i<=end; i++){
			var oLi = document.createElement('li');
			var oSpan = document.createElement('span');
			oSpan.innerHTML = i;
			oLi.appendChild(oSpan);
			addClass(oLi,name);
			parent.appendChild(oLi);
		}
	}

	//在日历中的hide元素中插入元素
	function insertHide(parent,tag,objInfo){
		var oEle = document.createElement(tag);
		if(objInfo){
			for(var attr in objInfo){
				oEle[attr] = objInfo[attr];
			}
		}
		parent.appendChild(oEle);
	}

	return {
		getCurrDays: getCurrDays,
		getPrevDays: getPrevDays,
		getWeekday: getWeekday,
		getPrevStart: getPrevStart,
		insertLi: insertLi,
		insertHide: insertHide
	};
})();

var getCurrDays = Calendar.getCurrDays,
	getPrevDays = Calendar.getPrevDays,
	getWeekday = Calendar.getWeekday,
	getPrevStart = Calendar.getPrevStart,
	insertLi = Calendar.insertLi,
	insertHide = Calendar.insertHide;
	
window.onload = function(){

	//nav背景图片
	(function(){
		var oNav = document.getElementById('nav');
		var aSpan = oNav.getElementsByTagName('span');
		var aLi = oNav.getElementsByTagName('li');

		for(var i=0; i<aLi.length; i++){
			aLi[i].index = i;
			aSpan[i].style.backgroundPosition = i*(-46) + "px 0";
			aLi[i].onmouseover = function(){
				aSpan[this.index].style.backgroundPosition = this.index*(-46) + 'px -46px';
			};
			aLi[i].onmouseout = function(){
				aSpan[this.index].style.backgroundPosition = this.index*(-46) + 'px 0';
			};
		}
	})();

	//search搜索框切换
	(function(){
		var aLi = document.getElementById('search').getElementsByTagName('li');
		var searchText = document.getElementById('search_text');
		var info = [
			'例如：荷棠鱼坊烤鱼 或 樱花日本料理',
			'例如：东直门内大街',
			'例如：亚马逊年终酬宾9折券',
			'例如：养猫达人的日常',
			'例如：私房红烧肉做法大揭秘'
		];
		var len = aLi.length;
		var temp = info[0];

		for(var i=0; i<len; i++){
			aLi[i].index = i;
			aLi[i].onclick = function(){
				for(var i=0; i<len; i++){
					removeClass(aLi[i],'active');
				}
				addClass(this,'active');
				searchText.value = info[this.index];
				temp = searchText.value;
			};
		}

		searchText.onfocus = function(){
			if(this.value==temp){
				this.value = '';
			}
		};

		searchText.onblur = function(){
			if(this.value==''){
				this.value = temp;
			}
		};
	})();

	// search文章列表切换
	(function(){
		var oPosts = document.getElementById('posts');
		var oUl = oPosts.getElementsByTagName('ul')[0];
		var oUp = document.getElementById('up_btn');
		var oDown = document.getElementById('down_btn');
		var classNames = ['author','time','title'];
		var data = [
			['萱萱','5分钟前','写了一篇新文章：那些灿烂华美的瞬间都在哪里','#'],
			['思思','15分钟前','写了一篇新文章：宝岛三日游详尽攻略','#'],
			['益田','47分钟前','写了一篇新文章：往事知多少？京城大小胡同的前世今生','#'],
			['林小莫','58分钟前','写了一篇新文章：uber的正确打开方式','#']
		];
		var timer = null;
		var dist = 0;
		var count = 0;
		var speed = 10;
		var step = speed;
		var moveShake = function(){
			shake(oUl,'top',7,2,60);
		};
		

		//把data内容放到ul中
		for(var i=0; i<data.length; i++){
			var info = data[i];
			var oLi = document.createElement('li');
			var oA = document.createElement('a');
			addClass(oLi,'ellipsis');
			for(var j=0; j<3; j++){
				var oSpan = document.createElement('span');
				oSpan.innerHTML = info[j];
				addClass(oSpan,classNames[j]);
				oA.appendChild(oSpan);
			}
			oA.href = info[3];
			oLi.appendChild(oA);
			oUl.appendChild(oLi);
		}

		//控制ul的移动
		dist = oLi.offsetHeight + parseInt(getStyle(oLi,'marginBottom'));
		timer = setInterval(moveUl,2000);
		oPosts.onmouseover = function(){
			clearInterval(timer);
		};
		oPosts.onmouseout = function(){
			timer = setInterval(moveUl,2000);
		};
		oUp.onclick = function(){
			if(count<data.length-1){
				count++;
				changeLi();
			}
		};
		oDown.onclick = function(){
			if(count>0){
				count--;
				changeLi();
			}
		};
		

		//移动ul
		function moveUl(){
			if(count===data.length-1){
				count = -1;
			}
			if(count==-1){
				step = 1.5 * speed;
				moveShake = null;
			}else{
				step = speed;
				moveShake = function(){
					shake(oUl,'top',7,2,60);
				};
			}
			count++;
			var end = -count * dist;
			move(oUl,'top',end,step,50,moveShake);
		}
		
		//上下翻动li
		function changeLi(){
			var end = -count * dist;
			moveShake = function(){
				shake(oUl,'top',7,2,60);
			};
			move(oUl,'top',end,step,50,moveShake);
		}
	})();

	//hot区播放器
	(function(){
		var video = document.getElementById('video');
		var controls = document.getElementById('controls');
		var playBtn = document.getElementById('play_btn');
		var stopBtn = document.getElementById('stop_btn');
		var progress = document.getElementById('progress');
		var progressBg = document.getElementById('progress_bg');
		var progressBar = document.getElementById('progress_bar');
		var current = document.getElementById('current');
		var total = document.getElementById('total');
		var mute = document.getElementById('mute');
		var mute_line = document.getElementById('mute_line');
		var progressBgLeft = 0; 
		var progressBarLeft = 0;

		if(navigator.userAgent.indexOf('Chrome')>0){ //修正Chrome下字体大小
			addClass(current,'font_fix');
			addClass(total,'font_fix');
		}

		if(document.createElement('video').canPlayType){
			//初始化
			if(video.controls){
				video.controls = false;
			}
			controls.style.display = 'block';
			play();
			total.innerHTML = formatTime(video.duration);
			video.onloadedmetadata = function(){	//for IE
				total.innerHTML = formatTime(video.duration);
			};
			progressBgLeft = getPos(progressBg).left;
			progressBarLeft = getPos(progressBar).left;
			
			//play键
			playBtn.onclick = play;

			//stop键
			video.onended = stopBtn.onclick = stop;

			//时间更新
			video.ontimeupdate = update;

			//静音
			mute.onclick = function(){
				video.muted = !video.muted;
				if(video.muted){
					mute_line.style.display = 'block';
				}else{
					mute_line.style.display = 'none';
				}

				return false;
			};
		}
		
		//拖动播放条
		function drag(ev){
			ev = ev || event;
			var dist = ev.pageX - getPos(progressBar).left;
			var bar = 0;
			video.ontimeupdate = null;
			progress.onclick = null;

			document.onmousemove = function(ev){
				ev = ev || event;
				var shift = ev.pageX - dist;
								
				if(shift<progressBarLeft){
					shift = progressBarLeft;
				}else if(shift>progressBg.offsetWidth+progressBarLeft){
					shift = progressBg.offsetWidth + progressBarLeft;
				}
				progressBar.style.left = shift - progressBarLeft - progressBar.offsetWidth/2 + 'px';
				bar = shift - progressBarLeft;
			};

			document.onmouseup = function(){
				updateByDist(bar);
				document.onmouseup = document.onmousemove = null;
				video.ontimeupdate = update;
				progress.onclick = jumpTo;
			};

			return false;
		}

		//播放条跳进
		function jumpTo(ev){
			ev = ev || event;
			var dist = ev.pageX - progressBgLeft;
			if(dist<0){
				dist = 0;
			}else if(dist>progressBg.offsetWidth){
				dist = progressBg.offsetWidth;
			}
			updateByDist(dist);
		}

		function updateByDist(dist){
			video.currentTime = dist / progressBg.offsetWidth * video.duration;
			progressBar.style.left = dist - progressBar.offsetWidth/2 + 'px';
		}

		function update(){
			var dist = video.currentTime/video.duration * progressBg.offsetWidth;
			current.innerHTML = formatTime(video.currentTime);
			progressBar.style.left = dist - progressBar.offsetWidth/2 + 'px';
		}
		
		function stop(){
			video.pause();
			video.currentTime = 0;
			progressBar.style.left = -progressBar.offsetWidth/2 + 'px';
			removeClass(playBtn,'active');
			progress.onclick = null;
			progressBar.onmousedown = null;
		}

		function play(){
			video.play();
			addClass(playBtn,'active');
			progress.onclick = jumpTo;
			progressBar.onmousedown = drag;
		}
	})();

	//不同版块的选项卡
	(function(){
		var shopTabs = new Tabs('shop','tabs','shop_list');	//shop区tabs
		var transportTabs = new Tabs('transport','tabs','transport_list');	//transport区tabs
		var adviceTabs = new Tabs('advice','tabs_s','advice_con');	//advice区tabs
		var couponsTabs = new Tabs('coupons','tabs_s','coupons_con');	//coupons区tabs

		shopTabs.init();
		transportTabs.init();
		adviceTabs.init();
		couponsTabs.init();
	})();

	//daily区
	(function(){
		var daily = document.getElementById('daily');
		var calendar = document.getElementById('calendar');
		var calUl = calendar.getElementsByTagName('ul')[0];
		var date = new Date();
		var data = [
			{	
				today:true,
				month:date.getMonth()+1,
				day:date.getDate(),
				weekday:getWeekday(date),
				pic:'images/content/daily1.gif',
				theme:'迟到的荣誉——维米尔的写实主义风俗画。领略现代主义画风与古典主义的完美结合。',
				href:'#'
			},
			{
				today:false,
				month:12,
				day:24, 
				weekday:'SAT',
				pic:'images/content/daily2.gif',
				theme:'冬季夜晚的圣诞曲。今夜不孤单，和朋友们一起欢唱圣诞之歌。',
				href:'#'
			}
		];

		//daily区title和theme内容
		(function(){
			var titleYear = document.getElementById('title_year');
			var titleMonth = document.getElementById('title_month');
			var month = document.getElementById('month');
			var day = document.getElementById('day');
			var themeText = document.getElementById('theme_text');
			var themePic = document.getElementById('theme_pic');
			
			titleYear.innerHTML = twoDigit(date.getFullYear());
			titleMonth.innerHTML = twoDigit(date.getMonth()+1);
			month.innerHTML = twoDigit(date.getMonth()+1);
			day.innerHTML = twoDigit(date.getDate());
			themeText.innerHTML = data[0].theme;
			themePic.src = data[0].pic;
			themePic.parentNode.href = data[0].href;
		})();

		//daily区日历
		(function(){						
			var prevMonDays = getPrevDays(date);
			var currMonDays = getCurrDays(date);
			var firstWeekday = new Date(date.getFullYear()+'/'+(date.getMonth()+1)+'/1').getDay();
			var prevStart = getPrevStart(firstWeekday,prevMonDays);
			var nextMonDays = firstWeekday==0 ? 42-currMonDays-6 : 42-currMonDays-firstWeekday+1;
			

			//插入上个月的部分
			if(prevStart>0){
				insertLi(calUl,'other',prevStart,prevMonDays);
			}

			//插入本月的部分
			insertLi(calUl,'curr',1,currMonDays);

			//插入下个月的部分
			insertLi(calUl,'other',1,nextMonDays);
		})();

		//在日历中插入图片和隐藏内容
		(function(){
			var aLi = calUl.getElementsByClassName('curr');

			for(var i=0; i<data.length; i++){
				var info = data[i];
				var oLi = aLi[info.day-1];
				var oImg = document.createElement('img');
				var oHide = document.createElement('div');
				oLi.timer = null;
				
				//在日历中插入图片
				oImg.src = info.pic;
				if(info.today){
					oImg.className = 'today';
				}
				oLi.appendChild(oImg);

				//在对应图片处插入hide
				insertHide(oHide,'img',{'src':info.pic});
				insertHide(oHide,'i');
				insertHide(oHide,'span',{'innerHTML':info.weekday});
				insertHide(oHide,'strong',{'innerHTML':'本日主题'});
				insertHide(oHide,'p',{'innerHTML':info.theme});
				insertHide(oHide,'a',{'href':info.href});
				oHide.className = 'hide';
				oLi.appendChild(oHide);
				
				//hide的显示和隐藏
				oLi.onmouseover = function(){
					clearTimeout(this.timer);
					this.getElementsByClassName('hide')[0].style.display = 'block';
				};
				oLi.onmouseout = function(){
					var _this = this;
					this.timer = setTimeout(function(){
						_this.getElementsByClassName('hide')[0].style.display = 'none';
					},300);
				};
			}
		})();
	})();
	
	//recommend区轮播图
	(function(){
		var oRec = document.getElementById('recommend');
		var oCarousel = oRec.getElementsByClassName('carousel')[0];
		var oThumbnailsArea = oRec.getElementsByTagName('ul')[0];
		var oPicsArea = oRec.getElementsByTagName('ul')[1];
		var oThumbnails = oThumbnailsArea.getElementsByTagName('li');
		var oPics = oPicsArea.getElementsByTagName('li');
		var oSpan = oCarousel.getElementsByTagName('span')[0];
		var info = [
			'爸爸去哪儿',
			'美妆潮流',
			'时尚资讯'
		];
		var num = 0;
		var timer = null;

		for(var i=0; i<oThumbnails.length; i++){
			oThumbnails[i].index = i;
			oThumbnails[i].onmouseover = function(){
				clear();
				num = this.index;
				changeInfo();
			};
		}
		rotate();
		oPicsArea.onmouseover = oThumbnailsArea.onmouseover = function(){
			clearInterval(timer);
		};
		oPicsArea.onmouseout = oThumbnailsArea.onmouseout = rotate;


		function clear(){
			for(var i=0; i<oThumbnails.length; i++){
				removeClass(oThumbnails[i],'active');
				removeClass(oPics[i],'active');
			}
		}

		function changeInfo(){
			oThumbnails[num].className = 'active';
			oPics[num].className = 'active';
			oSpan.innerHTML = info[num];
		}

		function rotate(){
			timer = setInterval(function(){
				clear();
				num++;
				num %= oThumbnails.length;
				changeInfo();
			},1500);
		}
	})();	

	//bbs区列表切换
	(function(){
		var bbs = document.getElementById('bbs');
		var aLi = bbs.getElementsByTagName('li');

		for(var i=0; i<aLi.length; i++){
			aLi[i].index = i;
			aLi[i].onmouseover = function(){
				for(var i=0; i<aLi.length; i++){
					aLi[i].className = '';
				}
				this.className = 'active';
			};
		}
	})();

	//stars红人烧客区隐藏面板
	(function(){
		var aA = document.getElementById('stars_list').getElementsByTagName('a');
		var data = ['','思雨','可欣','慕言','初妍','林志颖','胡敏芳','小童','紫光','科瞳','小冉'];
		for(var i=1; i<aA.length; i++){
			var oDiv = document.createElement('div');
			oDiv.innerHTML = data[i];
			aA[i].appendChild(oDiv);
			oDiv.style.display = 'none';

			aA[i].onmouseover = function(){
				this.getElementsByTagName('div')[0].style.display = 'block';
			};
			aA[i].onmouseout = function(){
				this.getElementsByTagName('div')[0].style.display = 'none';
			};
		}
	})();
};



