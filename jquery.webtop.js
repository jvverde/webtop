/**
 * $ WebTop Plugin
 * Copyright(c) 2011 Isidro Vila Verde
 * Dual licensed under the MIT and GPL licenses
 * Version: 0.01
 * Last Revision: 2011-04-30
 *
 * jquery.js         ()
 * jquery-ui.js      ()
 */
(function($){
	$.fn.webtop = function($o) {
		var $dummy = $('<div class="webtop_window"></div>').hide().appendTo(this); //just create it in order to get some defaults from CSS 
		var emptyFunction = function(){return true};
		var $webtop_options = $.extend(true,{
			menu:{
				css:{},
				panel:{
					maximize:{
						text:'Maximize All',
					},
					minimize:{
						text:'Minimize All',
					}
				}
			},
			user:{
				name:'I am a guest user',
				css:{ },
			},
			'window':{
				width: $dummy.width(),
				height: $dummy.height(),
				minWidth:200,
				minHeight:100,	
			},
			onShutdown:emptyFunction, 
		},$o);
		//the next line is just a trick to get the default z-index for class webtop_window
		var $defaultWindowIndex = parseInt($dummy.css('z-index')); 
		var $webtop = this.empty(); //clean webtop
		var $wallpaper = $('<div id="webtop_wallpaper"></div>').appendTo($webtop);
		var $workspace = $('<div id="webtop_workspace"></div>').appendTo($webtop);
		var $taskbar = $('<div id="webtop_taskbar"></div>').appendTo($webtop);
		var $startButton = $('<div id="webtop_startButton">Start</div>').appendTo($taskbar);//tornar configurável
		var $showWorkspace = $('<div id="webtop_workspaceIcon"></div>').appendTo($taskbar)
		.click(function(){
			$wtop.minimizeAll();
		}); 
		var $minimizebar = $('<div id="webtop_minimizebar"></div>').appendTo($taskbar);
		var $zIndex = parseInt($taskbar.css('z-index'));
		$taskbar.find('*').css('z-index',$zIndex+1);
		$startButton.hover(function(){
			$(this).addClass('webtop_hover');
		},function(){
			$(this).removeClass('webtop_hover');
		}).click(function(){
			if ($startMenu.is(':visible')){
				$startMenu.hide()
			}else{
				$startMenu.show()
			}
			return false;
		});
		var $startMenu = (function(){
			var $startMenu = $('<div id="webtop_startMenu"></div>');
			$startMenu.css('z-index',$zIndex-1);
			$taskbar.append($startMenu);
			var $user = $('<div id="webtop_loggedUser">'+$webtop_options.user.name+'</div>');
			$user.css($webtop_options.user.css);
			$startMenu.prepend($user);
			$startMenu.append($('<div id="webtop_startMenu_leftPanel">entries</div>'));
			var $rpanel = $('<div id="webtop_startMenu_rightPanel">Right</div>').appendTo($startMenu);
			var $h = parseInt($startMenu.outerHeight());
			$startMenu.css($.extend({},$webtop_options.menu.css,{ 
				top: -$h,	//go up
			})).click(function(ev){
				return false;
			});
			var $shutdown = $('<div id="webtop_logoutButton">Logout</div>').hover(function(){
				$(this).addClass('webtop_hover');
			},function(){
				$(this).removeClass('webtop_hover');
			}).click($webtop_options.onShutdown);
			$startMenu.find('#webtop_startMenu_rightPanel').append($shutdown);
			$startMenu.find('#webtop_startMenu_leftPanel').click(function(){
				$startMenu.hide();
				return false;
			});
			$(document).click(function(ev){
				$startMenu.hide();
			});
			var $maxAll = $('<div class="webtop_maximize_all">' + $webtop_options.menu.panel.maximize.text + '</div>').appendTo($rpanel)
			.click(function(){
				$wtop.maximizeAll();		
				$startMenu.hide();
				return false;
			})
			var $minAll = $('<div class="webtop_minimize_all">' + $webtop_options.menu.panel.minimize.text + '</div>').appendTo($rpanel)
			.click(function(){
				$wtop.minimizeAll();
				$startMenu.hide()
				return false;		
			})
			return $startMenu;
		})().hide();
		//end taskbar
		//start window stuff
		$(window).resize(function(){ //when the window browser resize check if the maximized windows needs to be adjusted to the new size
			//$('.webtop_window_maximize').has(':not(.webtop_window_minimize)').each(function(){ //the .has apparently doesn't work with several classes
			$('.webtop_window_maximize').each(function(){ //adjust maximimized windows to the new values
				if ($(this).is(':not(.webtop_window_minimize)')){ //but only if not minimized
					$(this).data('webtop').webtop_window.maximize();
				}
			});
			$('.webtop_window').not('.webtop_window_maximize').not('.webtop_window_minimize').trigger('resize.webtop');
		});
		//aux functions to be used by window stuff
		function push_window($win){ //put $win at front
			var $stack_window = new Array();	
			$('div.webtop_window',$webtop).not($win).each(function (i,w){ //construct one array with z-index for each window
				var $w = $(w);
				var $i = $w.css('z-index');
				$stack_window.push({
					i : $i,
					w : $w,
				});
			});
			$stack_window.sort(function($a,$b){
				return ($a.i -$b.i) // order $stack_window by ascending
			});
			$.each($stack_window,function($i,$a){ //compute new z-index and remove each window from the top
				var $z = $i + $defaultWindowIndex;
				$a.w.css('z-index',$z).removeClass('webtop_window_top');
				
			});
			var $topIndex = $defaultWindowIndex + $stack_window.length
			$win.css('z-index',$topIndex).addClass('webtop_window_top'); //put $win at top
			$minimizebar.find('.webtop_window_bar_selected').removeClass('webtop_window_bar_selected'); //remove all selected minimized bars
			//if ($win.not('.webtop_window_minimize')){ //The .not method seems not working well if we have several classes
			if ($win.is(':not(.webtop_window_minimize)')){//only signal the bar as selected if the window is not minimized
				$win.data('webtop').window_bar.addClass('webtop_window_bar_selected');
			}
			return $win;
		}
		function pop_window($win){ //remove $win from front
			var $stack_window = new Array({i:$defaultWindowIndex - 1, w: $win});	
			$('div.webtop_window',$webtop).not($win).each(function (i,w){
				var $w = $(w);
				var $i = $w.css('z-index');
				$stack_window.push({
					i : $i,
					w : $w,
				});
			});
			$stack_window.sort(function($a,$b){
				return ($a.i -$b.i) // order $stack_window by ascending
			});
			var $newwin = $stack_window.pop().w; //get the last window to be the new top window
			$.each($stack_window,function($i,$a){
				var $z = $i + $defaultWindowIndex;
				$a.w.css('z-index',$z).removeClass('webtop_window_top');
				
			});
			var $topIndex = $defaultWindowIndex + $stack_window.length
			$newwin.css('z-index',$topIndex).addClass('webtop_window_top'); //put $win at top
			$minimizebar.find('.webtop_window_bar_selected').removeClass('webtop_window_bar_selected');
			//if ($newwin.not('.webtop_window_minimize')){ //it seems not working if we have several classes
			if ($newwin.is(':not(.webtop_window_minimize)')){//only signal the icon as selected if the window is not minimized
				$newwin.data('webtop').window_bar.addClass('webtop_window_bar_selected');
			}
			return $win;
		}
		var $wtop = { //this is the returned object
			maximizeAll: function(){
				$webtop.find('.webtop_window').each(function(){
					$(this).data('webtop').webtop_window.maximize();
				});
				return $wtop;
			},
			minimizeAll: function(){
				$webtop.find('.webtop_window').each(function(){
					$(this).data('webtop').webtop_window.minimize();
				});
				return $wtop;
			},
			addWebtopIcon: (function(){
				var $nIcons = 0;
				var $webtop_icons = new Array();
				return function($o){
					var $icon_options = $.extend(true,{
						label: 'A new Icon',
						icon: '',
						onClick: emptyFunction,
					},$o);
					var $icon = $('<div class="webtop_icon"></div>').appendTo($workspace)
					.click($icon_options.onClick);
					var $content = $('<div><img></img><br><span></span></div>').appendTo($icon);
					$content.find('span').html($icon_options.label).end().find('img').attr('src',$icon_options.icon);
				}
			})(),	
			addWindow: (function(){ //create a new window
				var $nWindows = 0;
				return function($o){
					var $options = $.extend(true,{
						events: {
							afterWindowResize: emptyFunction,
							beforeClose: emptyFunction,
							afterClose: emptyFunction,
						},
						title:'',
						width: $webtop_options.window.width,
						height: $webtop_options.window.height,
						minWidth:$webtop_options.window.minWidth,
						minHeight:$webtop_options.window.minHeight,
						aspectRatio: false
					},$o);
					var $n = $nWindows++;

					var $window = $('<div id = "webtop_window_' + $n + '" class="webtop_window"></div>').appendTo($workspace);
					$window.width($options.width).height($options.height);
					var $window_bar = $('<div id = "webtop_window_bar_' + $n + '" class="webtop_window_bar"></div>').appendTo($minimizebar);
					var $window_header = $('<div id = "webtop_window_header_' + $n + '" class="webtop_window_header"></div>').appendTo($window);
					var $header_wrapper = $('<div class="webtop_window_header_wrapper"></div>').appendTo($window_header).html($options.title);
					if ($options.headerClass){
						$header_wrapper.addClass($options.headerClass);
					}
					var $bar_wrapper = $('<div class="webtop_window_bar_wrapper"></div>').appendTo($window_bar).html($options.title);
					if ($options.barClass){
						$bar_wrapper.addClass($options.barClass);
					}
					var $window_body = $('<div id = "webtop_window_body_' + $n + '" class="webtop_window_body"></div>').appendTo($window);
					$window_bar.click(function(){
						$webtop_window.show();
					});
					var $icon_minimize = $('<div id="webtop_window_icon_minimize_' + $n + '" class="webtop_window_icon_minimize"></div>')
					.appendTo($window_header)
					.click(function(){
						$webtop_window.minimize();
					});
					var $icon_maximize = $('<div id="webtop_window_icon_maximize_' + $n + '" class="webtop_window_icon_maximize"></div>')
					.appendTo($window_header)
					.click(function(){
						if ($window.hasClass('webtop_window_maximize')){
							$webtop_window.restore();
						}else{
							$webtop_window.maximize();
						}
					});
					var $icon_close = $('<div id="webtop_window_icon_close_' + $n + '" class="webtop_window_icon_close"></div>')
					.appendTo($window_header)
					.click(function(){
						$options.events.beforeClose();
						$window.remove();
						$window_bar.remove();
						$options.events.afterClose();
					});
					$('*[class^=webtop_window_icon_]',$window_header).hover(function(){
						$(this).addClass('webtop_hover');
					},function(){
						$(this).removeClass('webtop_hover');
					});
					$window.draggable({
						cancel:'a',
						containment:'parent',
						handle:'div.webtop_window_header',
						opacity: '0.5',
						start:function(){
							$window.addClass('webtop_window_drag');
						},
						stop:function(){
							$setPos();
							$window.removeClass('webtop_window_drag');
						},
					}).resizable({
						containment:'parent',
						minHeight: $options.minHeight,
						minWidth:$options.minWidth,
						aspectRatio: $options.aspectRatio,
						stop:function(ev,ui){
							$setDim();	//update the Dimensions
							$window.trigger('resize.webtop');
						},
						handles: 'all',
						ghost:true,
					}).click(function(){
						push_window($window); //don't replace $window by $(this). It is not the same. $this is the webtop element not the window
					});
					var $setDim = function(){
						$window.data('dim',{
							w:$window.width(),
							h:$window.height()
						});
					}
					var $setPos = function(){
						$window.data('pos',{
							t:$window.position().top,
							l:$window.position().left
						});
					}					
					$setDim(); //store the Dimensions
					$setPos();
					var $resize = function(){
						var $ww = $workspace.width();	//window width
						var $wh = $workspace.height();
						var $vw = $ww;								//viewport width
						var $vh = $wh;
						if ($options.aspectRatio){		//compute new viewport dimensions
							var $ar = parseInt($options.width,10) / parseInt($options.height,10);
							$vw = Math.min($ww, $wh * $ar);
							$vh = Math.min($wh, $ww / $ar);
						}
						var $dim = $window.data('dim');
						var $ow = $dim.w;							//old width
						var $oh = $dim.h;
						var $cw = $window.width();		//current width
						var $ch = $window.height();
						var $nw = Math.min($vw,Math.max($ow,$cw));	//new width
						var $nh = Math.min($vh,Math.max($oh,$ch));
						$window.width($nw);
						$window.height($nh);
						
						var $ct = $window.position().top;										//current top
						var $cl = $window.position().left;
						var $ot = $window.data('pos').t;										//old top
						var $ol = $window.data('pos').l;
						var $nt = Math.min($wh - $nh,Math.max($ct,$ot));		//new top
						var $nl = Math.min($ww - $nw,Math.max($cl,$ol));
						$window.css('top',$nt);
						$window.css('left',$nl);
				
						$options.events.afterWindowResize();
					};
					$window.bind('resize.webtop',$resize);
					$resize();
					var $restoreDim = {};
					var $webtop_window = {
						restore: function(){
							var $d = $restoreDim;
							try{
								$window.removeClass('webtop_window_maximize webtop_window_minimize').css({
									width:$d.width,
									height:$d.height,
									left:$d.left,
									bottom:$d.bottom,
									right:$d.right,
									top:$d.top,
								});
							}catch(e){
								alert('Error: Impossible to restore the window '+e);
							}
							$options.events.afterWindowResize();
							return $webtop_window;
						},
						minimize: function(){
							$window.effect('transfer',{to:$bar_wrapper,className:'webtop_window_transfer'},200,function(){
								$window.addClass('webtop_window_minimize');
								pop_window($window);
							});
							return $webtop_window;
						},
						show: function(){
							$window.removeClass('webtop_window_minimize');
							//devia ser feito aqui um efeito de transição
							push_window($window);
							$options.events.afterWindowResize();
						},
						maximize: function(){
							if (!$window.hasClass('webtop_window_maximize')){
								$restoreDim = {
									width:$window.css('width'),
									height:$window.css('height'),
									left:$window.css('left'),
									bottom:$window.css('bottom'),
									right:$window.css('right'),
									top:$window.css('top'),
								};
							}
							$window.addClass('webtop_window_maximize').css({
								left:'0px',
								bottom:'0px',
								right:'0px',
								top:'0px',
								width:'100%',
								height:'100%',
							}).removeClass('webtop_window_minimize');
							$options.events.afterWindowResize();
							push_window($window);
							return $webtop_window;
						},
						getBody: function(){
							return $window_body;
						},
						getHeader: function(){
							return $window_header;
						},
					};
					$window.data('webtop',{
						webtop_window: $webtop_window,
						window_bar: $window_bar,
					});
					push_window($window);
					return $webtop_window;
				}
			})(),
			//start startMenu stuff
			addMenuEntry: function($newEntries){
				$.each($newEntries,function($i,$e){
					var $e = $.extend({
						name: 'new entry',
						className : '',
						onClick: emptyFunction,
					},$e);
					var $entries = $startMenu.find('#webtop_startMenu_leftPanel');
					var $entry = $('<div class="webtop_startMenuEntry"></div>');
					var $content = $('<div class="' + $e.className + '">' + $e.name + '</div>').appendTo($entry);
					$entry.click($e.onClick);
					$entries.append($entry);	
				});
				return $wtop;
			},
		}
		return $wtop;
		//return $webtop;
	}
})(jQuery);
