/*********************************************************************************
 * animation 1.0 主程序
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2012-3-29
***********************************************************************************/

var move_info = {
	'z-index' : '9999',
	'position' : 'fixed',
	'right' : '50px',
	'top' : '50px',
	'width':'300px',
	'height':'55px',
	'background':'#333',
	'color':'#eee',
	'display':'inline-block',
	'font-family':'serif',
	'padding-top':'5px',
	'padding-left':'20px',
	'opacity':'0.8'
}


var a_css = {
	'z-index' : '99999',
	'background' : '#FDBE73',
	'opacity' : '0.9',
	'outline' : '#E0E581 solid 1px',
	'color':'#fff!important'
}


var layer_css = {
	'z-index' : '600',
	'opacity' : '0.9',
	'position' : 'absolute',
	'outline' : '#E0E581 solid 1px',
}



//drag_start($("#test"));



$(document).ready(function(){
	var dd1 = new DND(document.getElementById("test")).init();	
	//alert( document.documentElement.clientHeight );

});



function nav_init(){
	$('#mega-menu-2').dcMegaMenu({
		rowItems: '1',
		speed: 'fast',
		effect: 'fade',
		event: 'click'
	});
}

function frame_init(){
	$(".side_left").css({"width":frame_data.side_left,"height":browser_height-frame_data.nav_height});
	$(".side_right").css({"width":frame_data.side_right,"height":browser_height-frame_data.nav_height});
	$(".main").css({"margin-left":frame_data.side_left,"margin-right":frame_data.side_right});
	$(".timeline_ct").css({"height":frame_data.time_layer_height});
	$(".tl_left").css({"width":frame_data.time_layer_width});
	var time_list_area_width=browser_width-frame_data.side_left-frame_data.side_right-2-frame_data.time_layer_width-2
	$(".time_list_area").css({"width":time_list_area_width,"left":frame_data.time_layer_width+2,"height":frame_data.time_layer_height+19});
	$(".tl_time_list").css({"width":3000,"height":500});
	$(".canvas_area").css({"height":browser_height-frame_data.screen_height-frame_data.time_layer_height-67});//299+19+1+44+1+1
}


/*************************图层 时间线 区域 start****************************/
//显示时间轴刻度
function show_time_scale(){
	var html="";
	var time_s=0;
	for(var i=0;i<time_scale_data.count;i++){
		html+="<li style=\"margin-right:"+time_scale_data.margin+"px\">"+time_s+"s</li>"
		time_s+=time_scale_data.interval
	}
	$(".tl_time_list").html(html);
}



//当前时间线
function deal_needle(){
	$("#ico_needle").mousedown(function(e){
		var even = e ? e : window.event;
		if(e.button == 1 || e.button == 0){
			_startX = even.clientX;
			_startY = even.clientY;
			var needle_x=$("#ico_needle").parent()[0].style.left.replace("px","")*1;
			$(document).mouseup(function(){
				$("#ico_needle").unbind("mousemove");
				$("#ico_needle").unbind("mouseup");
				$(document).unbind("mousemove");
				$(document).unbind("mouseup");
			});
			$(document).mousemove(function(e){
				var e = e ? e : window.event;
				var left=e.clientX - _startX + needle_x;
				if(left<0)left=0;
				$("#ico_needle").parent().css({"left":left+"px"});
			});
			return false;
		}
	});
	$("#time_list_area").click(function(e){
		var even = e ? e : window.event;
		
		var _startX = even.clientX;
		var needle_left=_startX-frame_data.side_left-frame_data.time_layer_width-3
		$("#ico_needle").parent().css({"left":needle_left-5});

		return false;
	
	});
}


//时间线 放大缩小
function deal_zoom(){
	$("#ico_anchor").mousedown(function(e){
		var even = e ? e : window.event;
		if(e.button == 1 || e.button == 0){
			_startX = even.clientX;
			_startY = even.clientY;
			var anchor_x=$("#ico_anchor")[0].style.left.replace("px","")*1;
			$(document).mouseup(function(){
				$("#ico_anchor").removeClass("ico_anchor_hover");
				$("#ico_anchor").unbind("mousemove");
				$("#ico_anchor").unbind("mouseup");
				$(document).unbind("mousemove");
				$(document).unbind("mouseup");
			});
			$(document).mousemove(function(e){
				var e = e ? e : window.event;
				var zoom_level=[1,2,4,5,20,40,60,80,100];
				$("#ico_anchor").addClass("ico_anchor_hover");
				var left=e.clientX - _startX + anchor_x;
				if(left<-3)left=-3;
				else if(left>86)left=86;
				$("#ico_anchor").css({"left":left+"px"});
				var zoom=Math.round((left+4)*90/100);
				//var time_scale_data={"count":50,"margin":100,"interval":0.5}
				time_scale_data.margin=100-Math.round((zoom%10)/1.2);
				for(var i=0;i<zoom_level.length;i++){
					if(zoom_level[i]>zoom)
					{
						time_scale_data.interval=0.25*zoom_level[i];
						break;
					}
					else
						time_scale_data.interval=0.25;
				}
				show_time_scale();
				
			});
			return false;
		}
	});
	
	
}

/*************************图层 时间线 区域 end****************************/



/*************************画板区域 start****************************/
//显示坐标
function show_coordinate(){
	var coordinate_x_html="";
	var coordinate_y_html="";
	var coordinate_interval=get_canvas_zoom_interval(zoom_data.zoom_current)
	
	var coordinate_x_count=zoom_data.coordinate_count+Math.round(canvas_data.width*zoom_data.zoom_current/100/coordinate_interval)//坐标数量再加上画板宽占用的刻度数量，以保证画板在坐标正中心
	var coordinate_y_count=zoom_data.coordinate_count+Math.round(canvas_data.height*zoom_data.zoom_current/100/coordinate_interval)//坐标数量再加上画板高占用的刻度数量，以保证画板在坐标正中心

	var coor_num=-1*coordinate_interval*zoom_data.coordinate_count/2;
	for(var i=0;i<coordinate_x_count;i++){
		if(i==0)
			coordinate_x_html+="<li></li>";
		else
			coordinate_x_html+="<li>"+coor_num+"</li>";
		coor_num+=coordinate_interval;
	}

	coor_num=-1*coordinate_interval*zoom_data.coordinate_count/2;
	for(var i=0;i<coordinate_y_count;i++){
		if(i==0)
			coordinate_y_html+="<li></li>";
		else
			coordinate_y_html+="<li>"+coor_num+"</li>";
		coor_num+=coordinate_interval;
	}
	
	$(".coordinate_x").css({"width":coordinate_x_count*coordinate_interval*zoom_data.zoom_current/100});
	$(".coordinate_y").css({"height":coordinate_y_count*coordinate_interval*zoom_data.zoom_current/100});
	$(".coordinate_x").html(coordinate_x_html);
	$(".coordinate_y").html(coordinate_y_html);
	$(".coordinate_x > li").css({"width":coordinate_interval*zoom_data.zoom_current/100-1});
	$(".coordinate_y > li").css({"width":coordinate_interval*zoom_data.zoom_current/100,"height":coordinate_interval*zoom_data.zoom_current/100});//这个也有border，不知道为什么不要减1
	
	show_canvas();
	
	//滚轮事件
	$(".canvas_area").bind("scroll", function(){
		$(".coordinate_x").css({"top":$(".canvas_area")[0].scrollTop });
		$(".coordinate_y").css({"left":$(".canvas_area")[0].scrollLeft });
	})
	$(".canvas_area").scrollTop(zoom_data.coordinate_count*coordinate_interval/2*zoom_data.zoom_current/100 - ($(".canvas_area").height()-$(".canvas_range").height()*zoom_data.zoom_current/100)/2 );
	$(".canvas_area").scrollLeft(zoom_data.coordinate_count*coordinate_interval/2*zoom_data.zoom_current/100 - ($(".canvas_area").width()-$(".canvas_range").width()*zoom_data.zoom_current/100)/2 );
}


//显示画板
function show_canvas(){
	var coordinate_interval=get_canvas_zoom_interval(zoom_data.zoom_current)
	//计算canvas经过缩放后的偏移量
	var canvas_x_offset=(zoom_data.zoom_current/100-1)*canvas_data.width/2;
	var canvas_y_offset=(zoom_data.zoom_current/100-1)*canvas_data.height/2;
	$(".canvas_range").css({'width':canvas_data.width,'height':canvas_data.height});
	$(".canvas_range").css({"-webkit-transform":"scale("+zoom_data.zoom_current/100+", "+zoom_data.zoom_current/100+")"});
	$(".canvas_range").css({"left":zoom_data.coordinate_count*coordinate_interval*zoom_data.zoom_current/100/2 + canvas_x_offset});
	$(".canvas_range").css({"top":zoom_data.coordinate_count*coordinate_interval*zoom_data.zoom_current/100/2 + canvas_y_offset});
}


//画板放大缩小
function canvas_zoom(){
	$("#canvas_zoom_in").click(function(){
		get_canvas_zoom_level(-1);
		$("#canvas_zoom_num").text(zoom_data.zoom_current+"%");
		show_coordinate();
	});
	
	$("#canvas_zoom_out").click(function(){
		get_canvas_zoom_level(1);
		$("#canvas_zoom_num").text(zoom_data.zoom_current+"%");
		show_coordinate();
	});
	$("#canvas_zoom_num").click(function(){
		zoom_data.zoom_current=100;
		$("#canvas_zoom_num").text(zoom_data.zoom_current+"%");
		show_coordinate();
	});
}



//根据倍数获取当前坐标刻度间距
function get_canvas_zoom_interval(t){
	for(var i=0;i<zoom_data.zoom_level.length;i++){
		if(zoom_data.zoom_level[i][0]==t)
			return zoom_data.zoom_level[i][1];
	}
	return 0;
}


//zoom倍数变化
function get_canvas_zoom_level(t){
	var level=0;
	for(var i=0;i<zoom_data.zoom_level.length;i++){
		if(zoom_data.zoom_level[i][0]==zoom_data.zoom_current){
			level=i;
			break;
		}
	}
	level+=t*1;
	if(level<0)level=0;
	else if(level>zoom_data.zoom_level.length-1)level=zoom_data.zoom_level.length-1;
	zoom_data.zoom_current=zoom_data.zoom_level[level][0]
}


//画板初始化
function canvas_draw_init(){
	$("#canvas_range").mousedown(function(e){
		var even = e ? e : window.event;
		if(e.button == 1 || e.button == 0){
			_startX = even.clientX;
			_startY = even.clientY;
			var draw_rect="<div id=\"layer_1\"></div>";
			$("#canvas_range").append(draw_rect);
			$("#layer_1").css(layer_css);
			$("#layer_1").css({"left":e.clientX-_startX,"top":e.clientY-_startY});
			$(document).mouseup(function(){
				$("#canvas_range").unbind("mousemove");
				$("#canvas_range").unbind("mouseup");
				$(document).unbind("mousemove");
				$(document).unbind("mouseup");
			});
			$(document).mousemove(function(e){
				var e = e ? e : window.event;
				$("#layer_1").css({"width":e.clientX-_startX,"height":e.clientY-_startY});
				
			});
			return false;
		}
	});
	
	//画板宽
	$("#_p_canvas_width").click(function(){
		$("#_p_canvas_width").addClass("value_edit");
		$("#_p_canvas_width").select(); 
	});
	$("#_p_canvas_width").focusout(function(){
		$("#_p_canvas_width").blur()
		$("#_p_canvas_width").removeClass("value_edit");
		canvas_data.width=$("#_p_canvas_width").val()*1;
		show_canvas();
	});
	$("#_p_canvas_width").keyup(function(event){
		if (event.keyCode == '13') {
			$("#_p_canvas_width").focusout();
	   }
	});
	
	//画板高
	$("#_p_canvas_height").click(function(){
		$("#_p_canvas_height").addClass("value_edit");
		$("#_p_canvas_height").select(); 
	});
	$("#_p_canvas_height").focusout(function(){
		$("#_p_canvas_height").blur()
		$("#_p_canvas_height").removeClass("value_edit");
		canvas_data.height=$("#_p_canvas_height").val()*1;
		show_canvas();
	});
	$("#_p_canvas_height").keyup(function(event){
		if (event.keyCode == '13') {
			$("#_p_canvas_height").focusout();
	   }
	});
}


function canvas_drag_init(){
	$("#mod_canvas")[0].ondragover=function(ev) {/*拖拽元素在目标元素头上移动的时候*/
		ev.preventDefault();
		return true;
	}
	$("#mod_canvas")[0].ondragenter=function(ev) {/*拖拽元素进入目标元素头上的时候*/
		//$(this).addClass("rabbish_area_hover");
		return true;
	}
	$("#mod_canvas")[0].ondragleave=function(ev) {/*拖拽元素进入目标元素头上的时候*/
		//$(this).removeClass("rabbish_area_hover");
		return true;
	}
	$("#mod_canvas")[0].ondrop=function(ev) {/*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
		//$(this).removeClass("rabbish_area_hover");
		console.log(ev.dataTransfer.getData('text'));
		
		$("#canvas_range").html();
	
		return false;
	}
}

/*************************画板区域 end****************************/


/*************************属性面板区域 start****************************/
function tab_init(){
	$("#tab_area").find("a").click(function(){
		$("#tab_area").find("a").removeClass("current");
		$(this).addClass("current");
		$(".side_tab").hide();
		var tab_name=$(this).attr("id").replace("btn_","tab_");
		$("#"+tab_name).show();
	});
	lib_init();
	lib_show();
	rabbish_init();
}

function lib_show(){
	var data_area=[];
	data_area.push([ "project_name" , project_data.name ]);
	var data_str=requestToString(data_area);
	$.ajax({
		url:cgipath + 'image-showlist',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("加载文件列表失败！");},
		success:function(feedback){
			if(feedback.ret=="0"){
				var img_list=feedback.img_list;
				var img_html="";
				for(var i=0;i<img_list.length;i++){
					img_html+="<div class=\"item\" title=\""+img_list[i].name+"\" draggable=\"true\" name=\""+img_list[i].name+"\" style=\"height:"+img_list[i].height+"px;width:"+img_list[i].width+"px;background:url(server/project/"+project_data.name+"/"+img_list[i].thumb_name+") no-repeat center top;\">"
					img_html+="</div>"
				}
				$("#lib_list").hide();
				$("#lib_list").html(img_html);
				setTimeout("lib_waterfall();",500);
				lib_drag_init();
			}
			else{
			}
		}
	});
}

/*瀑布流*/
function lib_waterfall(){
	$('#lib_list').show();
	 $('#lib_list').masonry({
		itemSelector : '.item', //子类元素选择器
		columnWidth : 40 ,//一列的宽度 ，包括边距 220+10+10
		isAnimated:false, //使用jquery的布局变化，是否启用动画效果
		animationOptions:{
		//jquery animate属性 ，动画效果选项。比如渐变效果 Object { queue: false, duration: 500 }
		},
		gutterWidth:0,//列的间隙
		isFitWidth:false,//自适应宽度
		isResizableL:false,// 是否可调整大小
		isRTL:false,//使用从右到左的布局
	 });
	  
}

/*素材库*/
function lib_init(){
	$("#tab_lib")[0].ondragenter =function(){event.stopPropagation(); event.preventDefault();};
	$("#tab_lib")[0].ondragover =function(){event.stopPropagation(); event.preventDefault();};
	$("#tab_lib")[0].ondrop =function(){event.stopPropagation(); event.preventDefault();imgDrop(event)};

}

function imgDrop(event)
{
	var dt = event.dataTransfer;
	var files = dt.files;
	var file_data="";
	var img_data=[];;
	for (var i = 0,f; f=files[i],i < files.length; i++) {
		if(f.type.indexOf("image")!=-1){
			var imageReader = new FileReader();
			imageReader.onload = (function(aFile) {
				return function(e) {
					img_data.push({'name':aFile.fileName,'data':e.target.result});
					if(img_data.length==files.length){
						var data_area=[];
						data_area.push([ "img_data" , $.toJSON(img_data) ]);
						data_area.push([ "project_name" , project_data.name ]);
						var data_str=requestToString(data_area);
						$.ajax({
							url:cgipath + 'image-upload',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("上传文件失败！");},
							success:function(feedback){
								if(feedback.ret=="0"){
									lib_show();
								}
								else{
									lib_show();
								}
							}
						});
					}
				};
			})(f);
			imageReader.readAsDataURL(f);
		}
	}
}




/*lib库元素初始化*/
function lib_drag_init(){

	$("#tab_lib").find("img").each(function(index){
		$(this)[0].mousedown=function(){
			return false;
		}
	});
	var drag_arr=$("#tab_lib .item");
	for (var i=0; i<drag_arr.length; i++) {
		drag_arr[i].onselectstart = function() {
			return false;
		};
		drag_arr[i].ondragstart = function(ev) {
			$("#rabbish_area").addClass('rabbish_area_show');
			ev.dataTransfer.effectAllowed = "move";
			ev.dataTransfer.setData("text", $(ev.target).attr("name"));
			ev.dataTransfer.setDragImage(ev.target, 0, 0);
			return true;
		};
		drag_arr[i].ondragend = function(ev) {
			$("#rabbish_area").removeClass('rabbish_area_show');
			return true;
		};
	}
}






function drag_disable(){
	$(".timeline_area").bind('dragover',function(ev) {
		ev.preventDefault();
		return false;
	});
	$(".scenes_area").bind('dragover',function(ev) {
		ev.preventDefault();
		return false;
	});
	$(".side_right").bind('dragover',function(ev) {
		ev.preventDefault();
		return false;
	});
	
}



function rabbish_init(){
	$("#rabbish_area")[0].ondragover = function(ev) {/*拖拽元素在目标元素头上移动的时候*/
		ev.preventDefault();
		return true;
	};

	$("#rabbish_area")[0].ondragenter = function(ev) {/*拖拽元素进入目标元素头上的时候*/
		$(this).addClass("rabbish_area_hover");
		return true;
	};
	$("#rabbish_area")[0].ondragleave = function(ev) {/*拖拽元素进入目标元素头上的时候*/
		$(this).removeClass("rabbish_area_hover");
		return true;
	};
	$("#rabbish_area")[0].ondrop = function(ev) {/*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
		$(this).removeClass("rabbish_area_hover");
		var data_area=[];
		data_area.push([ "name" , ev.dataTransfer.getData('text') ]);
		data_area.push([ "project_name" , project_data.name ]);
		var data_str=requestToString(data_area);
		$.ajax({
			url:cgipath + 'image-del',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("删除文件失败！");},
			success:function(feedback){
				if(feedback.ret=="0"){
					lib_show();
				}
				else{
					lib_show();
				}
			}
		});
	
	
		return false;
	};
}


/*************************属性面板区域 end****************************/




/**********************公用函数 start **********************/
function ajax_timeout(){}

jQuery.extend({
	evalJSON: function (strJson) {
		return eval("(" + strJson + ")");
	}
});


jQuery.extend({
toJSON: function(object) { var type = typeof object; if ('object' == type) { if (Array == object.constructor) type = 'array'; else if (RegExp == object.constructor) type = 'regexp'; else type = 'object'; } switch (type) { case 'undefined': case 'unknown': return; break; case 'function': case 'boolean': case 'regexp': return object.toString(); break; case 'number': return isFinite(object) ? object.toString() : 'null'; break; case 'string': return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function() { var a = arguments[0]; return (a == '\n') ? '\\n': (a == '\r') ? '\\r': (a == '\t') ? '\\t': "" }) + '"'; break; case 'object': if (object === null) return 'null'; var results = []; for (var property in object) { var value = jQuery.toJSON(object[property]); if (value !== undefined) results.push(jQuery.toJSON(property) + ':' + value); } return '{' + results.join(',') + '}'; break; case 'array': var results = []; for (var i = 0; i < object.length; i++) { var value = jQuery.toJSON(object[i]); if (value !== undefined) results.push(value); } return '[' + results.join(',') + ']'; break; } } });


function requestToString(data_area) {
	var ret = "";
	for (var i = 0; i < data_area.length; i++) {
		ret += "&" + data_area[i][0];
		ret += "=" + encodeURIComponent(data_area[i][1]);
	}
	ret += "&rand=" + Math.round((Math.random() * 1000000));
	return ret;
}
/**********************公用函数 end**********************/












