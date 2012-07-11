/*********************************************************************************
 * animation 1.0 主程序
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2012-3-29
***********************************************************************************/
var cgipath="server/index.php?";
var browser_width=document.documentElement.clientWidth;//浏览器宽
var browser_height=document.documentElement.clientHeight;//浏览器高
var project_info={'id':'','name':'','author':'','time_add':'','time_save':'','privacy':1,'layer_count':0};
//框架数据：左列宽、右列宽、图层宽、图层高
var frame_data={"nav_height":40,"side_left":0,"side_right":344,"time_layer_width":194,"time_layer_height":149,"scenes_height":0}
//时间轴数据：刻度数量、刻度间距、刻度时间差
var time_scale_data={"count":30,"margin":100,"interval":0.5}
//画板数据：宽、高、背景样式(0透明 1纯色 2图片)、背景颜色、背景图片
var canvas_data={"width":400,"height":300,"background_type":1,"background_color":"#fff","background_image":""}
//画板放放数据:当前倍数，坐标数量，[显示倍数、刻度值]
var zoom_data={"zoom_current":100,"coordinate_count":40,"zoom_level":[[10,500],[30,200],[50,100],[70,100],[80,100],[100,50],[120,50],[140,50],[160,50],[200,50],[300,20],[400,20],[800,10],[1200,5]]}
var layer_data=[];//图层数据

var _id_frame_current;//当前帧ID
var _id_layer_current;//当前图层id
var _object_canvas_item=null;//当前可拖拽的元素的Transform_Adjust对象
var _flag_text_edit=false;//当前为文字编辑状态时，不响性快捷键
var _flag_play=0;

$(document).ready(function(){
	wrap_init();				//加载框架
	
	nav_init();					//显示导航
	
	show_time_scale();			//显示时间条
	timeline_init();			//时间线初始化
	timeline_zoom_init();		//时间线缩放初始化

	canvas_zoom_init();			//画板缩放初始化
	show_coordinate();			//显示标尺
	canvas_drag_init();			//画板拖放初始化
	canvas_bg_init();			//画板背景设置

	drag_disable();				//设置不可拖放区域
	tab_init();					//右列选项面板初始化
	effect_init();				//加载特效库
	
	key_handle();				//快捷键处理
	frame_window_init();		//iframe初始化
	//skill_init();
});

function frame_window_init(){
	if(project_info.id.length==0){
		$('#app_canvas_frame').css({'height':'auto'});
		$('#frame_window').css({'width':600,'margin-top':-240,'margin-left':-300});
		$('#app_canvas_frame').attr('src','project_list.htm');
		$('.frame_window_area').show();
	}
}

function nav_init(){
	$('#mega-menu-2').dcMegaMenu({
		rowItems: '1',
		speed: 'fast',
		effect: 'fade',
		event: 'click'
	});
	$("#mod_nav").find(".sub > li a").click(function(){nav_close();});
	
	$("#nav_project_save").click(function(){project.save();});
	$("#nav_page_preview").click(function(){project.save();});
	$("#nav_project_list").click(function(){
		$('#app_canvas_frame').css({'height':'auto'});
		$('#frame_window').css({'width':600,'margin-top':-240,'margin-left':-300});
		$('#app_canvas_frame').attr('src','project_list.htm');
		$('.frame_window_area').show();
	});
	$("#nav_project_add").click(function(){
		$('#app_canvas_frame').css({'height':'auto'});
		$('#frame_window').css({'width':600,'margin-top':-240,'margin-left':-300});
		$('#app_canvas_frame').attr('src','project_add.htm');
		$('.frame_window_area').show();
	});
	
	$("#nav_help_about").click(function(){
		$('#app_canvas_frame').css({'height':'auto'});
		$('#frame_window').css({'width':600,'margin-top':-240,'margin-left':-300});
		$('#app_canvas_frame').attr('src','about.htm');
		$('.frame_window_area').show();
	});
	$("#nav_help_help").click(function(){
		$('#app_canvas_frame').css({'height':'auto'});
		$('#frame_window').css({'width':600,'margin-top':-240,'margin-left':-300});
		$('#app_canvas_frame').attr('src','help.htm');
		$('.frame_window_area').show();
	});
	$("#nav_help_skill").click(function(){
		skill_show();
	});
	$("#nav_option_coordinate").click(function(){
		if($('.coordinate_x').hasClass('hide')){
			$('.coordinate_x,.coordinate_y').removeClass("hide");
			
			$(this).text("隐藏坐标")
		}else{
			$('.coordinate_x,.coordinate_y').addClass("hide");
			$(this).text("显示坐标")
		}
	});
	$("#nav_option_scenes").click(function(){
		if(frame_data.scenes_height==0){
			frame_data.scenes_height=122;
			wrap_init();
			
			$(this).text("隐藏场景区")
		}else{
			frame_data.scenes_height=0;
			wrap_init();
			$(this).text("显示场景区")
		}
	});
	$("#nav_option_del_frame").click(function(){
		frame_item_del();
	});
	$("#nav_option_del_layer").click(function(){
		layer_del(_id_layer_current);
	});
}

function nav_close(){
	$("#mod_nav").find(".mega-hover").removeClass("mega-hover");
	$("#mod_nav").find(".sub").hide();
}

function wrap_init(){
	$(".wrap").css({"height":browser_height });
	$(".side_left").css({"width":frame_data.side_left,"height":browser_height-frame_data.nav_height});
	$(".side_right").css({"width":frame_data.side_right,"height":browser_height-frame_data.nav_height});
	$(".main").css({"margin-left":frame_data.side_left,"margin-right":frame_data.side_right});
	$(".timeline_ct,.layer_area,#frame_layer_area ").css({"height":frame_data.time_layer_height});
	$(".layer_area").css({"height":frame_data.time_layer_height-10});
	$(".timeline_layer").css({"width":frame_data.time_layer_width});
	var frame_area_width=browser_width-frame_data.side_left-frame_data.side_right-2-frame_data.time_layer_width-2;
	$(".frame_area").css({"width":frame_area_width,"left":frame_data.time_layer_width+2,"height":frame_data.time_layer_height+19});
	$(".frame_layer").css({"width":3000});
	$(".time_mark").css({"width":3000,"height":100});
	$(".canvas_area").css({"height":browser_height-frame_data.scenes_height-frame_data.time_layer_height-45-40-21});
	$(".scenes_area").css({"height":frame_data.scenes_height});
	$(window).unbind('resize').resize(wrap_resize);
}

function wrap_resize() {
	
	browser_width=document.documentElement.clientWidth;//浏览器宽
	browser_height=document.documentElement.clientHeight;//浏览器高
	wrap_init();
}
/*************************图层 时间线 区域 start****************************/
//显示时间轴刻度
function show_time_scale(firstflag){
	var html="";
	var time_s=0;
	for(var i=0;i<time_scale_data.count;i++){
		if(time_scale_data.margin*(i+1)>=3000)break;
		html+="<li style=\"margin-right:"+(time_scale_data.margin-1)+"px\">"+time_s+"s</li>"
		time_s+=time_scale_data.interval
		
	}
	$(".time_mark").html(html);
	
	if(firstflag){
		var left=(time_scale_data.interval/0.5)-3;
		$("#ico_anchor").css({"left":left+"px"});
	}
				
}

/*时间线初始化*/
function timeline_init(){
	$("#time_line").mousedown(function(e){
		//console.log('time_line mousedown');
		var even = e ? e : window.event;
		if(e.button == 1 || e.button == 0){
			_startX = even.clientX;
			_startY = even.clientY;
			var needle_x=$("#time_line").css("left").replace("px","")*1;
			$(document).mouseup(function(){
				$("#time_line").unbind("mousemove");
				$("#time_line").unbind("mouseup");
				$(document).unbind("mousemove");
				$(document).unbind("mouseup");
			});
			$(document).mousemove(function(e){
				var e = e ? e : window.event;
				var left=e.clientX - _startX + needle_x;
				if(left<0)left=0;
				$("#time_line").css({"left":left+"px"});
				canvas_item_current_set();
			});
			return false;
		}
	});
	$("#frame_area").click(function(e){
		//console.log('frame_area click');
		$(".frame_item").removeClass("frame_item_current");
		$(".layer_list li").removeClass("current");
		var even = e ? e : window.event;
		var _startX = even.clientX;
		var needle_left=_startX-frame_data.side_left-frame_data.time_layer_width-3+Math.floor($("#frame_area .overview").css('left').replace('px',''))*-1;
		$("#time_line").css({"left":needle_left-5});
		
		canvas_item_reset();
		property_reset(0);
		return false;
	
	});
}

//时间线 放大缩小
function timeline_zoom_init(){
	$("#ico_anchor").mousedown(function(e){
		//console.log('ico_anchor mousedown');
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
				
				frame_item_show(1);
				
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
	$(".canvas_range").css({'background-color':canvas_data.background_color});
	$(".canvas_range").css({"-webkit-transform":"scale("+zoom_data.zoom_current/100+", "+zoom_data.zoom_current/100+")"});
	$(".canvas_range").css({"left":zoom_data.coordinate_count*coordinate_interval*zoom_data.zoom_current/100/2 + canvas_x_offset});
	$(".canvas_range").css({"top":zoom_data.coordinate_count*coordinate_interval*zoom_data.zoom_current/100/2 + canvas_y_offset});
	
	if(canvas_data.background_image!=""){
		var img_src="server/project/"+project_info.id+"/"+canvas_data.background_image;
		$("#canvas_range").css({'backgroundImage':'url('+img_src+')'});
	}
	else{
		$("#canvas_range").css({'backgroundImage':''});
	}
	
	
}


//画板放大缩小
function canvas_zoom_init(){
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

/*画板接受拖拽元素*/
function canvas_drag_init(){
	$("#mod_animator_canvas")[0].ondragover=function(ev) {/*拖拽元素在目标元素头上移动的时候*/
		$("#canvas_bg_set").show();
		ev.preventDefault();
		return true;
	}
	$("#mod_animator_canvas")[0].ondragenter=function(ev) {/*拖拽元素进入目标元素头上的时候*/
		$("#canvas_bg_set").show();
		//$(this).addClass("rabbish_area_hover");
		return true;
	}
	$("#mod_animator_canvas")[0].ondragleave=function(ev) {/*拖拽元素进入目标元素头上的时候*/
		//$("#canvas_bg_set").hide();
		//$(this).removeClass("rabbish_area_hover");
		return true;
	}
	$("#mod_animator_canvas")[0].ondrop=function(ev) {/*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
		$("#canvas_bg_set").hide();
		//$(this).removeClass("rabbish_area_hover");
		var data= $.evalJSON(ev.dataTransfer.getData('text'));
		if(data.width==undefined)return;
		/*
			注意：计算拖拽后的坐标，比较复杂，因为要考虑到画板的缩放
			计算方法：	1、先算出鼠标距离白板原点的位置，需要进行偏移，偏移量为 -canvas_data.width/2
						2、对第1步的结果进行缩放：*100/zoom_data.zoom_current
						3、对最终结果再进行偏移，偏移量为 +canvas_data.width/2
		*/
		var _x=(ev.clientX-frame_data.side_left+$(".canvas_area").scrollLeft()-$("#canvas_range").css("left").replace("px","")-canvas_data.width/2)*100/zoom_data.zoom_current+canvas_data.width/2;
		var _y=(ev.clientY-frame_data.nav_height-$(".timeline_area").height()-20+$(".canvas_area").scrollTop()-$("#canvas_range").css("top").replace("px","")-canvas_data.height/2)*100/zoom_data.zoom_current+canvas_data.height/2;
		var frame_style={'width':data.width+'px','height':data.height+'px'};
		var layer_style={'width':data.width+'px','height':data.height+'px',"background_size_x":100,"background_size_y":100,"background_image":data.name,"left":_x+"px","top":_y+"px"};
		
		_id_layer_current="layer_"+project_info.layer_count;
		layer_data.push({"id":"layer_"+project_info.layer_count,"name":"New_layer_"+project_info.layer_count,"iteration":"1","use_flag":0,"style":$.toJSON(layer_style),"frame":{"count":1,"data":[{"id":"frame_item_0","style":$.toJSON(frame_style),"custom_style":"","time":"0"}]},"img":{"name":data.name,"width":data.width,"height":data.height}});
		project_info.layer_count++;
		

		layer_init();
		canvas_item_init();
		frame_init();
		frame_item_show();
		canvas_item_current_set(_id_layer_current,'frame_item_0');
		return false;
	}
}


/*图层初始化*/
function layer_init(first_flag){
	//显示当前图层
	var layer_html="";
	if(first_flag)$("#layer_list").html(layer_html);
	for(var i=0;i<layer_data.length;i++){
		var layer_id=layer_data[i].id;
		if(layer_id==_id_layer_current || first_flag){
			layer_html+="<li layer_id=\""+layer_id+"\">";
			layer_html+="<i class=\"ico ico_slide_move\"  draggable=\"true\"></i>";
			layer_html+="<input class=\"name\" value=\""+layer_data[i].name+"\" disabled />";
			layer_html+="<span class=\"option\">";
			layer_html+="<a href=\"javascript:\" class=\"ico ico_dot_lock\"></a>";
			layer_html+="<a href=\"javascript:\" class=\"ico ico_dot_eye\"></a>";
			layer_html+="</span>";
			layer_html+="</li>";
		}
	}
	$("#layer_list").html($("#layer_list").html()+layer_html);
	
	//设置时间线的高度
	
	//选择层
	$("#layer_list").find("li").unbind('click').click(function(){
			var layer_id=$(this).attr("layer_id");
			canvas_item_current_set(layer_id)
	});
	//mouseover效果
	$("#layer_list").find("li").unbind('mouseover').mouseover(function(){
			$(this).addClass("hover");
	});
	$("#layer_list").find("li").unbind('mouseleave').mouseleave(function(){
			$(this).removeClass("hover");
	});
	//滚动条
	$("#layer_area").tinyscrollbar({'fn':function(){
		var top=$(this).find(".overview").css("top");
		$("#frame_layer").css({'top':top});
	}});
	//设置帧区域高度
	
	//设置层可以拖动
	$("#layer_list li").each(function(){
		$(this)[0].ondragover=function(ev) {/*拖拽元素在目标元素头上移动的时候*/
			ev.preventDefault();
			return true;
		}
		$(this)[0].ondragenter=function(ev) {/*拖拽元素进入目标元素头上的时候*/
			return true;
		}
		$(this)[0].ondragleave=function(ev) {/*拖拽元素进入目标元素头上的时候*/
			return true;
		}
		$(this)[0].ondrop=function(ev) {/*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
			//$(this).removeClass("rabbish_area_hover");
			var layer_orig= ev.dataTransfer.getData('text');
			layer_switch(layer_orig,$(this).attr('layer_id'));
			return false;
		}
	});
	
	$("#layer_list .ico_slide_move").each(function(){
		$(this)[0].onselectstart = function() {
			return false;
		};
		$(this)[0].ondragstart = function(ev) {
			ev.dataTransfer.effectAllowed = "move";
			ev.dataTransfer.setData("text", $(ev.target).parent().attr('layer_id'));
			ev.dataTransfer.setDragImage($(ev.target).parent()[0], 0, 5);
			$("#rabbish_layer_area").addClass('rabbish_area_show');
			return true;
		};
		$(this)[0].ondragend = function(ev) {
			$("#rabbish_layer_area").removeClass('rabbish_area_show');
			return true;
		};
	});

	//修改层名
	$("#layer_list li").unbind('dblclick').dblclick(function(){
		$(this).find(".name").removeAttr("disabled").addClass("value_edit");
	});
	$("#layer_list li .name").unbind('focusout').focusout(function(){
		_flag_text_edit=false;
		for(var i=0;i<layer_data.length;i++){
			if(layer_data[i].id==_id_layer_current){
				layer_data[i].name=$(this).val();
			}
		}
		$(this).attr("disabled","disabled").removeClass("value_edit");
	});
	$("#layer_list li .name").unbind('keydown').keydown(function(e){
		_flag_text_edit=true;
	});
	
	//显示帧容器
	var frame_html="";
	if(first_flag)$("#frame_layer").html(frame_html);
	for(var i=0;i<layer_data.length;i++){
		var layer_id=layer_data[i].id;
		if(layer_id==_id_layer_current || first_flag){	
			frame_html+="<div layer_id=\""+layer_id+"\" class=\"frame_layer_line\">";
			frame_html+="<span class=\"frame_bg\" style=\"\"></span>";
			frame_html+="</div>";
		}
	}
	
	$("#frame_layer").html($("#frame_layer").html()+frame_html);
	$("#frame_area").tinyscrollbar({ axis: 'x'});//横向滚动条
	
	
	//在画板中显示当前图层的元素
	var canvas_html="";
	if(first_flag)$("#canvas_range").html(canvas_html);
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].use_flag==0 || first_flag){
			
			var layer_id=layer_data[i].id;
			
			canvas_html+="<div id=\""+layer_id+"\" class=\"canvas_item\" style=\""+get_style(layer_data[i].frame.data[0].style)+"\" >"
			canvas_html+="<style id=\"style_"+layer_id+"\">#"+layer_id+"{"+get_style(layer_data[i].style);
			if(layer_data[i].custom!=undefined)canvas_html+=layer_data[i].custom;
			canvas_html+="}</style>";
			canvas_html+="</div>";
			layer_data[i].use_flag=1;
			
		}
	}
	$("#canvas_range").append(canvas_html);
}

/*2个层之间交换*/
function layer_switch(layer1,layer2){
	var layer1_index=0;
	var layer2_index=0;
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==layer1)layer1_index=i;
		if(layer_data[i].id==layer2)layer2_index=i;
	}
	var layer_tmp=layer_data[layer1_index];
	layer_data[layer1_index]=layer_data[layer2_index];
	layer_data[layer2_index]=layer_tmp;
	
	layer_data[layer1_index].id=layer1;
	layer_data[layer2_index].id=layer2;
	
	project_repaint();
	
	canvas_item_reset()
	canvas_item_current_set(layer2)
}

/*删除图层*/
function layer_del(layer_id){
	if(layer_id==undefined || layer_id==null){
		message.show("message_div","提示","未选中图层！",4)
		return;
	}
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==layer_id){
			layer_data.splice(i,1);
			project_repaint();
			canvas_item_reset()
		}
	}
}

/*画板上的元素初始化*/
function canvas_item_init(){
	$("#mod_animator_canvas").unbind("click").click(function(){
		if(_object_canvas_item!=null){
			_object_canvas_item.remove();
			_object_canvas_item=null;
		}
		$("#layer_list").find("li").removeClass("current");
		$("#frame_layer").find(".frame_item_current").removeClass("frame_item_current");
		_id_layer_current=null;
		property_reset(0);
	});

	$(".canvas_item").unbind("mousedown").mousedown(function(e){
		canvas_item_reset();
		var layer_id=$(this).attr("id");
		canvas_item_current_set(layer_id)
		_object_canvas_item.onMouseDown_move(event);
		return false;
	});
}


/*设置帧可以滑动*/
var frame_item_current=null;//当前可拖动的帧对象
function frame_item_adjust(){
	//console.log("frame_item_adjust");
	$(".frame_item").unbind("mousedown").mousedown(function(e){
	
		var even = e ? e : window.event;
		var _startX = even.clientX;
		var needle_left=_startX-frame_data.side_left-frame_data.time_layer_width-3+Math.floor($("#frame_area .overview").css('left').replace('px',''))*-1;

		$("#time_line").css({"left":needle_left-5});
		
		canvas_item_reset();
		_id_frame_current=$(this).attr("item_id");
		frame_item_current=new Frame_Item_Adjust($(this)[0]);
		frame_item_current.init();
		frame_item_current.onMouseDown(e);
		return false;
	});
	$(".frame_item").unbind("click").click(function(e){
		return false;
	});
	
}

/*删除当前帧*/
function frame_item_del(){
	if(_id_frame_current==null)return;
	for(var i=0;i<layer_data.length;i++){
		var obj_id=layer_data[i].id;
		if(obj_id==_id_layer_current){
			var frame_data=layer_data[i].frame.data;
			if(frame_data.length==1){
				message.show("message_div","提示","最后一帧不能删除！",4)
				break;
			}
			for(var j=0;j<frame_data.length;j++){
				if(frame_data[j].id==_id_frame_current){
					//delete layer_data[i].frame.data[j];
					layer_data[i].frame.data.splice(j,1);
					frame_item_show(layer_data[i].id);
					canvas_item_reset();
					canvas_item_current_set(layer_data[i].id);
				}
			}
		}
	}
}


/*
选择画板上的当前元素
	layer_id:必选
	frame_item_id:可选
*/
function canvas_item_current_set(layer_id,frame_item_id){
	//console.log('[canvas_item_current_set]layer_id='+layer_id+',frame_item_id='+frame_item_id);
	if(layer_id=="" || layer_id==undefined){
		return;
	}
	else 
		_id_layer_current=layer_id;
	
	if(_object_canvas_item!=null){
		_object_canvas_item.remove();
		_object_canvas_item=null;
	}

	var frame_item_style="";
	var frame_item_custom_style="";
	for(var i=0;i<layer_data.length;i++){
		var obj_id=layer_data[i].id;
		if(obj_id==layer_id){
			var frame_data=layer_data[i].frame.data;
			
			//如果未传 frame_item_id ，根据时间线找到最近的帧start
			if(frame_item_id==undefined || frame_item_id==""){
				var frame_left_obj={'id':'','time':10000,'style':''};
				var frame_right_obj={'id':'','time':10000,'style':''};
				var timeline_info=timeline_get();
				
				for(var j=0;j<frame_data.length;j++){
					var time_diff=frame_data[j].time*1-timeline_info.time*1;
					
					if(time_diff<=0){
						if(frame_left_obj.time>time_diff*-1){
							frame_left_obj.id=frame_data[j].id;
							frame_left_obj.time=time_diff*-1;
						}
					}
					else if(time_diff>0){
						if(frame_right_obj.time>time_diff){
							frame_right_obj.id=frame_data[j].id;
							frame_right_obj.time=time_diff;
						}
					}
				}
				var frame_item_id=frame_left_obj.id;
				if(frame_left_obj.id==''){
					frame_item_id=frame_right_obj.id;
				}
				//如果未传frame_item_id，根据时间线找到最近的帧end
			}
			for(var j=0;j<frame_data.length;j++){
				if(frame_data[j].id==frame_item_id){
					frame_item_style=frame_data[j].style;
					frame_item_custom_style=frame_data[j].custom_style;
				}
			}
		}
	}
	
	_object_canvas_item=new Transform_Adjust($("#"+layer_id)[0]);
	_object_canvas_item.init();
		
	$("#frame_layer").find(".frame_item").removeClass("frame_item_current");
	$("#layer_list").find("li").removeClass("current");
	$("#layer_list").find("li[layer_id='"+layer_id+"']").addClass("current");
	
	
	_id_frame_current=frame_item_id;
	$("#frame_layer").find(".frame_layer_line[layer_id='"+layer_id+"']").find("a[item_id='"+frame_item_id+"']").addClass("frame_item_current");//当前帧高亮
	if(frame_item_custom_style!="")$("#"+layer_id).attr("style",get_style(frame_item_style)+frame_item_custom_style);
	property_reset();//设置属性面板中的值
}



/*根据时间线，找到每个图层最邻近的帧，并重置画板上所有元素的样式*/
function canvas_item_reset(){
	//console.log("canvas_item_reset");
	var timeline_info=timeline_get();
	if(_object_canvas_item!=null){
		_object_canvas_item.remove();
		_object_canvas_item=null;
	}
	_id_layer_current=null;
	for(var i=0;i<layer_data.length;i++){
		
		var frame_data=layer_data[i].frame.data;
		var frame_left_obj={'id':'','time':10000,'style':'','custom_style':''};
		var frame_right_obj={'id':'','time':10000,'style':'','custom_style':''};
		
		for(var j=0;j<frame_data.length;j++){
			var time_diff=frame_data[j].time*1-timeline_info.time*1;
		
			if(time_diff<=0){
				if(frame_left_obj.time>time_diff*-1){
					frame_left_obj.id=frame_data[j].id;
					frame_left_obj.time=time_diff*-1;
					frame_left_obj.style=frame_data[j].style;
					frame_left_obj.custom_style=frame_data[j].custom_style;
				}
			}
			else if(time_diff>0){
				if(frame_right_obj.time>time_diff){
					frame_right_obj.id=frame_data[j].id;
					frame_right_obj.time=time_diff;
					frame_right_obj.style=frame_data[j].style;
					frame_right_obj.custom_style=frame_data[j].custom_style;
				}
			}
		}
		var frame_item_style_last=frame_left_obj;
		if(frame_left_obj.id==''){
			frame_item_style_last=frame_right_obj;
			
		}
		$("#"+layer_data[i].id).attr("style",get_style(frame_item_style_last.style)+frame_item_style_last.custom_style);//设置图板上当前元素样式
		
	}
}



/*计算动画的样式*/
function frame_compute(layer_id){//如果未传layer_id，将计算所有层的动画
	
	//foreach($project_json->layer_data as $layer_data){
	var page_style="";
	for(var i=0;i<layer_data.length;i++){
		//取出时间最大最小值，得到总时间
		var layer_style="";
		var frame_time_min=10000;
		var frame_time_max=0;
		//foreach($layer_data->frame->data as $frame_data){
		var frame_data=layer_data[i].frame.data;
		for(var j=0;j<frame_data.length;j++){
			var time_temp=(frame_data[j].time*1).toFixed(2);;
			if(frame_time_min>time_temp)frame_time_min=time_temp;
			if(frame_time_max<time_temp)frame_time_max=time_temp;
		}
		
		var frame_time_total=frame_time_max-frame_time_min;
		if(frame_time_max==frame_time_min)frame_time_total=1;//如果只有1帧，强制时长为1秒
		
		var frame_key="frame_"+layer_data[i].id;
		var animation_style=$.evalJSON(layer_data[i].style);
		var animation_str="-webkit-animation: "+frame_key+" "+frame_time_total+"s"
		if(animation_style.animation_iteration!=undefined)animation_str+=" "+animation_style.animation_iteration;
		else	animation_str+=" infinite";
		if(animation_style.animation_timing_function!=undefined)animation_str+=" "+animation_style.animation_timing_function;
		if(animation_style.animation_direction!=undefined)animation_str+=" "+animation_style.animation_direction;
		if(frame_time_min>0)animation_str+=" "+frame_time_min+"s";
		layer_style+=".canvas_range_play #"+layer_data[i].id+"{"+animation_str+";-webkit-animation-fill-mode:both;}\n";
		
		layer_style+="@-webkit-keyframes "+frame_key+" {\n";
		
		//foreach($layer_data->frame->data as $frame_data){
		for(var j=0;j<frame_data.length;j++){
			var time_temp=(frame_data[j].time*1).toFixed(2);;
			var time_percent=100*(time_temp-frame_time_min)/frame_time_total;
			time_percent=time_percent.toFixed(2);
			layer_style+="\t"+time_percent+"% {"+get_style(frame_data[j].style)+frame_data[j].custom_style+"}\n";
		}
		if(frame_time_max==frame_time_min){//如果只有1帧，也要补齐动画，因为可能帧有延时
			layer_style+="\t100% {"+get_style(frame_data[0].style)+"}\n";
		}
		layer_style+="}\n";
		
		if(layer_id==undefined || layer_id==layer_data[i].id)page_style+=layer_style;
	}
	return page_style;
}

/*鼠标在时间线区域的相对left值*/
function get_timeline_info(even){
	var frame_x = even.clientX-frame_data.side_left-frame_data.time_layer_width-3+$("#frame_area").scrollLeft();
	var frame_time=frame_x*time_scale_data.interval/time_scale_data.margin;
	frame_time=frame_time.toFixed(2);
	return  {"frame_x":frame_x,"frame_time":frame_time};
}


/*帧区域初始化*/
function frame_init(){
	//双击创建帧
	$("#frame_layer").find(".frame_layer_line").unbind("dblclick").dblclick(function(e){
		$(".frame_item").removeClass("frame_item_current");
		var even = e ? e : window.event;
		if(e.button == 1 || e.button == 0){
			var frame_line_info=get_timeline_info(even);
			var layer_id=$(this).attr("layer_id");
			//先找到最近的帧，取出它的样式
			var frame_near_style="";
			for(var i=0;i<layer_data.length;i++){
				if(layer_data[i].id==layer_id){
					var frame_near_left_time=10000;
					var frame_near_right_time=10000;
					var frame_near_left_style="";
					var frame_near_right_style="";
					var frame_data=layer_data[i].frame.data
					for(var j=0;j<frame_data.length;j++){
						var time_diff=frame_data[j].time*1-frame_line_info.frame_time*1;
						if(time_diff<=0){
							if(frame_near_left_time>time_diff*-1){
								frame_near_left_time=time_diff*-1;
								frame_near_left_style=frame_data[j].style;
							}
						}
						else if(time_diff>0){
							if(frame_near_right_time>time_diff){
								frame_near_right_time=time_diff;
								frame_near_right_style=frame_data[j].style;
							}
						}
					}
					frame_near_style=frame_near_left_style;
					if(frame_near_style=="")frame_near_style=frame_near_right_style;
				}
			}
			for(var i=0;i<layer_data.length;i++){
				if(layer_data[i].id==layer_id){
					var frame_data_item={"id":"frame_item_"+layer_data[i].frame.count,"time":frame_line_info.frame_time,"style":frame_near_style,"custom_style":""};
					layer_data[i].frame.data.push(frame_data_item);
					layer_data[i].frame.count++;
					var frame_item_html="<a item_id=\""+frame_data_item.id+"\" style=\"left:"+(frame_line_info.frame_x-6)+"px;\" class=\"frame_item frame_item_current\"></a>";
					_id_frame_current=frame_data_item.id;
					$(this).append(frame_item_html);
					frame_item_adjust();
				}
			}
			property_reset();
		}
	});
	
	//在帧区域单击选择图层
	$("#frame_layer").find(".frame_layer_line").unbind('click').click(function(e){
		var even = e ? e : window.event;
		var _startX = even.clientX;
		var needle_left=_startX-frame_data.side_left-frame_data.time_layer_width-3+Math.floor($("#frame_area .overview").css('left').replace('px',''))*-1;
		$("#time_line").css({"left":needle_left-5});
		canvas_item_reset();
		canvas_item_current_set($(this).attr('layer_id'));
		e.stopPropagation(); 
		e.preventDefault();
		return false;
	
	});
	//播控按钮
	$("#control_play").unbind("click").click(function(){
		if(_flag_play==0){
			$("#control_play").addClass("ico_play_hover");
			$("#time_line").css({"left":0});
			canvas_item_reset();
			var frame_style=frame_compute();
			$("#canvas_animation_style").html(frame_style);
			$("#canvas_range").removeClass("canvas_range_play").addClass("canvas_range_play");
			$("#canvas_range").removeClass("canvas_range_pause");
			_flag_play=1;
		}
		else if(_flag_play==2){
			$("#control_play").addClass("ico_play_hover");
			$("#control_pause").removeClass("ico_pause_hover");
			$("#canvas_range").removeClass("canvas_range_pause");
			_flag_play=1;
		}
	});
	$("#control_pause").unbind("click").click(function(){
		if(_flag_play==1){
			$("#control_pause").addClass("ico_pause_hover");
			$("#control_play").removeClass("ico_play_hover");
			$("#canvas_range").addClass("canvas_range_pause");
			_flag_play=2;
		}
	});
	$("#control_stop").unbind("click").click(function(){
		if(_flag_play!=0){
			$("#control_pause").removeClass("ico_pause_hover");
			$("#control_play").removeClass("ico_play_hover");
			$("#canvas_animation_style").html('');
			$("#canvas_range").removeClass("canvas_range_play").removeClass("canvas_range_pause");
			_flag_play=0;
		}
	});
}

 

/*获取时间线信息*/
function timeline_get(){
	var timeline_x=$("#time_line").css("left").replace("px","")*1+7;//加7的偏移
	var timeline_time=timeline_x*time_scale_data.interval/time_scale_data.margin;
	timeline_time=timeline_time.toFixed(2);
	return {"left":timeline_x,"time":timeline_time}
}


/*显示当前图层所有的帧*/
function frame_item_show(first_flag){
	if(first_flag)$("#frame_layer").find(".frame_layer_line").html("");
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==_id_layer_current || first_flag){
			var frame_data_item=layer_data[i].frame.data;
			for(var j=0;j<frame_data_item.length;j++){
				
				var frame_x=frame_data_item[j].time*time_scale_data.margin/time_scale_data.interval;
				//console.log(frame_x);
				var frame_item_current="";
				if(first_flag)frame_item_current="";
				var frame_item_html="<a item_id=\""+frame_data_item[j].id+"\" style=\"left:"+frame_x+"px;\" class=\"frame_item "+frame_item_current+"\"></a>";
				$("#frame_layer").find(".frame_layer_line[layer_id='"+layer_data[i].id+"']").append(frame_item_html);
			}
		}
	}
	frame_item_adjust();
}



/*设置帧的时间*/
function frame_item_time_set(layer_id,frame_item_id,time){
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==layer_id){
			var frame_item_data=layer_data[i].frame.data;
			for(var j=0;j<frame_item_data.length;j++){
				if(frame_item_data[j].id==frame_item_id){
					layer_data[i].frame.data[j].time=time;
				}
			}
		}
	}
}

//帧背景初始化
function frame_bg_reset(layer_id){
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==layer_id){
			var _left_min=10000;
			var _left_max=0;
			var frame_item_data=layer_data[i].frame.data;
			for(var j=0;j<frame_item_data.length;j++){
				if(_left_min>frame_item_data[j].time)_left_min=frame_item_data[j].time;
				if(_left_max<frame_item_data[j].time)_left_max=frame_item_data[j].time;
			}
			_left_min=_left_min*time_scale_data.margin/time_scale_data.interval-9;
			_left_max=_left_max*time_scale_data.margin/time_scale_data.interval+12;
			$("#frame_layer").find(".frame_layer_line[layer_id='"+layer_id+"']").find(".frame_bg").css({"left":_left_min,"width":_left_max-_left_min});;
		}
	}
}

//图层样式保存
function layer_style_save(obj){
	//console.log(obj);
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==_id_layer_current){
			var style_obj=$.evalJSON(layer_data[i].style);
			for(var key in obj){
				var key_temp=key;
				eval("style_obj."+key_temp+"=\""+obj[key]+"\"");
			}
			layer_data[i].style=$.toJSON(style_obj);
			//并设置下去
			var custom_style="";
			if(layer_data[i].custom!=undefined)custom_style=layer_data[i].custom;
			$("#style_"+layer_data[i].id).html("#"+layer_data[i].id+"{"+get_style(layer_data[i].style)+custom_style+"}")
		}
	}
}

//帧样式保存
function frame_style_save(obj){
	//console.log(obj);
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==$(_object_canvas_item._dragElement).attr("id")){
			var frame_item_data=layer_data[i].frame.data;
			for(var j=0;j<frame_item_data.length;j++){
				if(frame_item_data[j].id==_id_frame_current){
					var style_obj=$.evalJSON(frame_item_data[j].style);
					for(var key in obj){
						var key_temp=key;
						//key_temp=key.replace(/-webkit-animation-timing-function/g,'AnimationTimingFunction');
						//key_temp=key.replace(/-webkit-transform/g,'transform');
						//key_temp=key.replace(/-webkit-animation-iteration-count/g,'AnimationIterationCount');
					
						eval("style_obj."+key_temp+"=\""+obj[key]+"\"");
					}
					frame_item_data[j].style=$.toJSON(style_obj);
				}
			}
		}
	}
}

/*读取样式*/
//var orig_style="{\"background_size_x\":100,\"background_size_y\":100;\"background_image\":"+layer_data[i].img.name+"}"
function get_style(style){
	
	var ret="";
	var style_obj=$.evalJSON(style);
	var special_key=['translate_x','translate_y','translate_z','skew','scale_x','scale_y','rotate','rotate_x','rotate_y','background_size_x','background_size_y','background_image','border_width','border_color','border_type','border_radius','animation_timing_function','animation_iteration','animation_direction','origin_x','origin_y','perspective'];
	for(var key in style_obj){
		if(!In_array(key,special_key)){
			ret+=key+":"+style_obj[key]+";";
		}
	}
	
	if(style_obj['rotate']!=undefined || style_obj['rotate_x']!=undefined || style_obj['rotate_y']!=undefined || style_obj['translate_x']!=undefined || style_obj['translate_y']!=undefined || style_obj['scale_x']!=undefined || style_obj['scale_y']!=undefined || style_obj['skew']!=undefined || style_obj['perspective']!=undefined){
		var rotate=(style_obj['rotate']!=undefined)?style_obj['rotate']:0;
		var rotate_x=(style_obj['rotate_x']!=undefined)?style_obj['rotate_x']:0;
		var rotate_y=(style_obj['rotate_y']!=undefined)?style_obj['rotate_y']:0;
		var translate_x=(style_obj['translate_x']!=undefined)?style_obj['translate_x']:0;
		var translate_y=(style_obj['translate_y']!=undefined)?style_obj['translate_y']:0;
		var translate_z=(style_obj['translate_z']!=undefined)?style_obj['translate_z']:0;
		var scale_x=(style_obj['scale_x']!=undefined)?style_obj['scale_x']:1;
		var scale_y=(style_obj['scale_y']!=undefined)?style_obj['scale_y']:1;
		var skew=(style_obj['skew']!=undefined)?style_obj['skew']:0;
		var perspective=(style_obj['perspective']!=undefined)?style_obj['perspective']:0;
		
		var transform_css="-webkit-transform:";
		try{transform_css+="perspective("+perspective+"px) ";}catch(e){};
		try{transform_css+="translate("+translate_x+"px,"+translate_y+"px) ";}catch(e){};
		try{transform_css+="translateZ("+translate_z+"px) ";}catch(e){};
		try{transform_css+="scale("+scale_x+","+scale_y+") ";	}catch(e){};
		try{transform_css+="skew("+skew+"deg) ";	}catch(e){};
		try{transform_css+="rotate("+rotate+"deg) ";}catch(e){};
		try{transform_css+="rotateX("+rotate_x+"deg) ";}catch(e){};
		try{transform_css+="rotateY("+rotate_y+"deg) ";}catch(e){};
		
		transform_css+=";";
		ret+=transform_css;
	}
	
	if(style_obj['origin_x']!=undefined){
		var origin_css="-webkit-transform-origin:"+style_obj['origin_x']+"% "+style_obj['origin_y']+"%;";
		ret+=origin_css;
	}
	
	if(style_obj['background_size_x']!=undefined){
		var background_css="background-size:"+style_obj['background_size_x']+"% "+style_obj['background_size_y']+"%;";
		ret+=background_css;
	}
	
	if(style_obj['background_image']!=undefined){
		var background_css="background-image:url(server/project/"+project_info.id+"/"+style_obj['background_image']+");";
		ret+=background_css;
	}
	
	if(style_obj['border_width']!=undefined){
		var border_css="border:"+style_obj['border_color']+" "+style_obj['border_type']+" "+style_obj['border_width']+"px;";
		ret+=border_css;
	}
	
	if(style_obj['border_radius']!=undefined){
		var border_css="border-radius:"+style_obj['border_radius']+"px;";
		ret+=border_css;
	}
	
	//console.log(ret);
	return ret;
}

//解析transform字符串
function parseTransform(str){
		var skew=0;
		var scale='1,1';
		var rotate=0;
		try{
			skew=str.match(/skew\((.*?)deg\)/i)[1];
			scale=str.match(/scale\((.*?)\)/i)[1];
			
			rotate=str.match(/rotate\((.*?)deg\)/i)[1];
			
		}catch(e){}
		return({"skew":skew,"scale":scale,"rotate":rotate})
}

//帧样式 删除某属性
function frame_style_del(obj){
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==$(_object_canvas_item._dragElement).attr("id")){
			var frame_item_data=layer_data[i].frame.data;
			for(var j=0;j<frame_item_data.length;j++){
				if(frame_item_data[j].id==_id_frame_current){
					var style_obj=$.evalJSON(frame_item_data[j].style);
					for(var key in obj){
						var key_temp=key;
						key_temp=key.replace(/-webkit-animation-timing-function/g,'AnimationTimingFunction');
						eval("delete style_obj."+key);
					}
					frame_item_data[j].style=$.toJSON(style_obj);
				}
			}
		}
	}
}
/*************************画板区域 end****************************/


/*************************属性面板区域 start****************************/
function tab_init(){
	$("#tab_area").find("a").unbind('click').click(function(){
		$("#tab_area").find("a").removeClass("current");
		$(this).addClass("current");
		$(".side_tab").hide();
		var tab_name=$(this).attr("id").replace("btn_","tab_");
		$("#"+tab_name).show();
		
		if(tab_name=="tab_lib")$("#upload_file_watermark").show();
		else $("#upload_file_watermark").hide();
		
	});
	
	property_init();
	lib_init();
	rabbish_init();
}

/*显示属性面板*/
var property_status;
function property_init(){
	//切换属性面板
	property_status=$.evalJSON(localStorage.getItem("property_status"));
	if(property_status==null)
		property_status={"property_project":1,"property_layer":1,"property_animation":1,"property_frame":1,"property_transform":0,"property_border":0,"property_custom":0};
	
	$(".property_block").each(function(){
		var id=$(this).attr("id");
		eval("var status=property_status."+id);
		if(status==0)
			$(this).addClass('property_block_hide');
	})
	
	$(".property_block .hd").unbind('click').click(function(){
		$(this).parent().parent().toggleClass('property_block_hide');
		var id=$(this).parent().parent().attr("id");
		if($(this).parent().parent().hasClass('property_block_hide'))
			eval("property_status."+id+"=0");
		else
			eval("property_status."+id+"=1");
		
		localStorage.setItem("property_status",$.toJSON(property_status));
	})
	
	//激活模拟select框
	$(".jsSelect").each(function(i){ 
		$(".jsSelect ").unbind('click').click(function(){
			if($(this).find(".select_content").css('display')=="none")
				$(this).find(".select_content").show();
			else
				$(this).find(".select_content").hide();
		});

		$(".jsSelect").unbind('mouseleave').mouseleave(function(){
			$(this).find(".select_content").delay(500).slideUp();
		});
		$(".select_content li").unbind('mouseenter').mouseenter(function(){
			$(this).css("background","#00A5FF").css("color","#00314D")
		});
		$(".select_content li").unbind('mouseleave').mouseleave(function(){
			$(this).css("background","none").css("color","inherit")
		});
		$("#select_content_animation_time_function li,#select_content_animation_direction li").unbind('click').click(function(){
			$(this).parent().parent().find(".select_show").text($(this).text());
			$(this).parent().hide();
		});
		$("#select_content_border li").unbind('click').click(function(){
			$(this).parent().parent().find(".select_show").html($(this).html());
			handle_frame_border();
			$(this).parent().hide();
		});
	});
	
	//激活颜色选择面板
	$('#_p_canvas_bg_show').ColorPicker({
		color: '#ffffff',
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#_p_canvas_bg_show').css('backgroundColor', '#' + hex);
			$('#_p_canvas_bg').val('#' + hex);
			canvas_data.background_color='#' + hex;
			$("#canvas_range").css({'background-color':'#' + hex});
		},
		onSubmit: function(hsb, hex, rgb, el) {
			$(el).ColorPickerHide();
		}
	});
	
	
	
	$('#_p_object_border_color_show').ColorPicker({
		color: '#333333',
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#_p_object_border_color_show').css('backgroundColor', '#' + hex);
			$('#_p_object_border_color').val('#' + hex);
		},
		onSubmit: function(hsb, hex, rgb, el) {
			$(el).ColorPickerHide();
			handle_frame_border();
		}
	});
	
	//value输入框事件处理
	$("#tab_property .value,#tab_property .textarea").click(function(){
		$(this).addClass("value_edit");
		$(this).select(); 
		_flag_text_edit=true;
	});
	$("#tab_property .value,#tab_property .textarea").keyup(function(){
		if (event.keyCode == '13') {
			$(this).focusout();
	   }
	});
	$("#tab_property .value,#tab_property .textarea").focusout(function(){
		_flag_text_edit=false;
	});
	
	//画板宽
	$("#_p_canvas_width").focusout(function(){
		$("#_p_canvas_width").blur()
		$("#_p_canvas_width").removeClass("value_edit");
		canvas_data.width=$("#_p_canvas_width").val()*1;
		show_canvas();
	});
	
	//画板高
	$("#_p_canvas_height").focusout(function(){
		$("#_p_canvas_height").blur()
		$("#_p_canvas_height").removeClass("value_edit");
		canvas_data.height=$("#_p_canvas_height").val()*1;
		show_canvas();
	});
	
	//画板背景色
	$("#_p_canvas_bg").focusout(function(){
		$("#_p_canvas_bg").blur()
		$("#_p_canvas_bg").removeClass("value_edit");
		var p_value=$(this).val();
		$('#_p_canvas_bg_show').css('backgroundColor', p_value);
		canvas_data.background_color=p_value;
		$("#canvas_range").css({'background-color':p_value});
	});
	
	//图层名称
	$("#_p_layer_name").focusout(function(){
		$("#_p_layer_name").blur()
		$("#_p_layer_name").removeClass("value_edit");
		for(var i=0;i<layer_data.length;i++){
			if(layer_data[i].id==_id_layer_current){
				layer_data[i].name=$("#_p_layer_name").val();
				$("#layer_area li[layer_id="+_id_layer_current+"] .name").val($("#_p_layer_name").val());
			}
		}
	});
	
	//图层自定义样式
	$("#_p_layer_custom").focusout(function(){
		$("#_p_layer_custom").blur()
		$("#_p_layer_custom").removeClass("value_edit");
		for(var i=0;i<layer_data.length;i++){
			if(layer_data[i].id==_id_layer_current){
				layer_data[i].custom=$("#_p_layer_custom").val();
				layer_style_save({});
			}
		}
		
	});
	
	//图层ID,暂不允许修改图层ID
	/*
	$("#_p_layer_id").focusout(function(){
		$("#_p_layer_id").blur()
		$("#_p_layer_id").removeClass("value_edit");
		for(var i=0;i<layer_data.length;i++){
			if(layer_data[i].id==_id_layer_current){
				layer_data[i].id=$("#_p_layer_id").val();
				_id_layer_current=$("#_p_layer_id").val();
				project_repaint();
				canvas_item_reset()
				canvas_item_current_set(_id_layer_current)
			}
		}
	});
	*/
	//动画播放次数
	$("#_p_animation_iteration").focusout(function(){
		$("#_p_animation_iteration").blur()
		$("#_p_animation_iteration").removeClass("value_edit");
		var p_value=$("#_p_animation_iteration").val();
		if(_id_layer_current!=""){
			layer_style_save({'animation_iteration':p_value});
		}
	});
	$("#_p_animation_iteration_set").click(function(){
		$("#_p_animation_iteration").blur()
		$("#_p_animation_iteration").removeClass("value_edit");
		if(_id_layer_current!=""){
			$("#_p_animation_iteration").val('infinite');
			layer_style_save({'animation_iteration':'infinite'});
		}
	});
	//动画变化率
	$("#select_content_animation_time_function li").click(function(){
		var p_value=$(this).html();
		if(_id_layer_current!=""){
			layer_style_save({'animation_timing_function':p_value});
		}
	});
	
	//动画循环方式
	$("#select_content_animation_direction li").click(function(){
		var p_value=$(this).text();
		if(_id_layer_current!=""){
			layer_style_save({'animation_direction':p_value});
		}
	});
	
	//时间
	$("#_p_frame_time").focusout(function(){
		$("#_p_frame_time").blur()
		$("#_p_frame_time").removeClass("value_edit");
		var p_value=$("#_p_frame_time").val()*1;
		if(_id_layer_current!=""){
			for(var i=0;i<layer_data.length;i++){
				if(layer_data[i].id==_id_layer_current){
					var frame_data=layer_data[i].frame.data;
					for(var j=0;j<frame_data.length;j++){
						if(frame_data[j].id==_id_frame_current){
							layer_data[i].frame.data[j].time=p_value;
							$("#time_line").css({"left":p_value*time_scale_data.margin/time_scale_data.interval});
							frame_item_show(layer_data[i].id);
							canvas_item_reset();
							canvas_item_current_set(layer_data[i].id);
						}
					}
				}
			}
		}
	});
	
	//透明度
	$("#_p_object_opacity").focusout(function(){
		$("#_p_object_opacity").blur()
		$("#_p_object_opacity").removeClass("value_edit");
		var p_value=$("#_p_object_opacity").val()*1;
		if(_id_layer_current!=""){
			if(p_value<=100 && p_value>=0){
				var style_obj={'opacity':(p_value/100).toFixed(2)};
				$("#"+_id_layer_current).css(style_obj)
				if(p_value<100)frame_style_save(style_obj);
				else frame_style_del(style_obj)
			}
		}
	});
	
	//宽
	$("#_p_object_width").focusout(function(){
		$("#_p_object_width").blur()
		$("#_p_object_width").removeClass("value_edit");
		var p_value=$("#_p_object_width").val()*1;
		if(_id_layer_current!=""){
			if(p_value>=0){
				var style_obj={'width':(p_value)+"px"};
				$("#"+_id_layer_current).css(style_obj)
				frame_style_save(style_obj);
			}
		}
	});
	
	//高
	$("#_p_object_height").focusout(function(){
		$("#_p_object_height").blur()
		$("#_p_object_height").removeClass("value_edit");
		var p_value=$("#_p_object_height").val()*1;
		if(_id_layer_current!=""){
			if(p_value>=0){
				var style_obj={'height':(p_value)+"px"};
				$("#"+_id_layer_current).css(style_obj)
				frame_style_save(style_obj);
			}
		}
	});
	
	//x
	$("#_p_object_x").focusout(function(){
		$("#_p_object_x").blur()
		$("#_p_object_x").removeClass("value_edit");
		var p_value=$("#_p_object_x").val()*1;
		if(_id_layer_current!=""){
			var style_obj={"left":(p_value)+"px"};
			$("#"+_id_layer_current).css(style_obj)
			layer_style_save(style_obj);
		}
	});
	
	//y
	$("#_p_object_y").focusout(function(){
		$("#_p_object_y").blur()
		$("#_p_object_y").removeClass("value_edit");
		var p_value=$("#_p_object_y").val()*1;
		if(_id_layer_current!=""){
			var style_obj={"top":(p_value)+"px"};
			$("#"+_id_layer_current).css(style_obj)
			layer_style_save(style_obj);
		}
	});
	
	//transform
	$("#_p_object_translate_x,#_p_object_translate_y,#_p_object_translate_z,#_p_object_rotate,#_p_object_skew,#_p_object_scale_x,#_p_object_scale_y,#_p_object_transform_origin_x,#_p_object_transform_origin_y,#_p_object_rotate_x,#_p_object_rotate_y,#_p_object_perspective").focusout(function(){
		$("#_p_object_translate_x,#_p_object_translate_y,#_p_object_translate_z,#_p_object_rotate,#_p_object_skew,#_p_object_scale_x,#_p_object_scale_y,#_p_object_transform_origin_x,#_p_object_transform_origin_y,#_p_object_rotate_x,#_p_object_rotate_y,#_p_object_perspective").blur().removeClass("value_edit")
		if(_id_layer_current!=""){
			var transform_str="";
			if($("#_p_object_translate_x").val()*1!=0 || $("#_p_object_translate_y").val()*1!=0)
				transform_str+=" translate("+$("#_p_object_translate_x").val()+"px,"+$("#_p_object_translate_y").val()+"px)";
			if($("#_p_object_translate_z").val()*1!=0)
				transform_str+=" translateZ("+$("#_p_object_translate_z").val()+"px)";
			if($("#_p_object_skew").val()*1!=0)
				transform_str+=" skew("+$("#_p_object_skew").val()+"deg)";
			if($("#_p_object_scale_x").val()*1!=100 || $("#_p_object_scale_y").val()*1!=100)
				transform_str+=" scale("+$("#_p_object_scale_x").val()/100+","+$("#_p_object_scale_y").val()/100+")";
			if(	$("#_p_object_rotate").val()*1!=0)
				transform_str+=" rotate("+$("#_p_object_rotate").val()+"deg)";
			if(	$("#_p_object_rotate_x").val()*1!=0)
				transform_str+=" rotateX("+$("#_p_object_rotate_x").val()+"deg)";
			if(	$("#_p_object_rotate_y").val()*1!=0)
				transform_str+=" rotateY("+$("#_p_object_rotate_y").val()+"deg)";
			if(	$("#_p_object_perspective").val()*1!=0)
				transform_str+=" perspective("+$("#_p_object_perspective").val()+"PX)";	
			var transform_css={"-webkit-transform":transform_str};
			
			$("#"+_id_layer_current).css(transform_css);
			var style_obj={'translate_x':$("#_p_object_translate_x").val(),'translate_y':$("#_p_object_translate_y").val(),'translate_z':$("#_p_object_translate_z").val(),'rotate':$("#_p_object_rotate").val(),'rotate_x':$("#_p_object_rotate_x").val(),'rotate_y':$("#_p_object_rotate_y").val(),'skew':$("#_p_object_skew").val(),'scale_x':$("#_p_object_scale_x").val()/100,'scale_y':$("#_p_object_scale_y").val()/100,'perspective':$("#_p_object_perspective").val()};
			frame_style_save(style_obj);
		}
	});
	
	//transform-origin
	$("#_p_object_transform_origin_x,#_p_object_transform_origin_y").focusout(function(){
		$("#_p_object_scale_x,#_p_object_scale_y").blur().removeClass("value_edit")
		if(_id_layer_current!=""){
			var transform_css={"-webkit-transform-origin":$("#_p_object_transform_origin_x").val()/100+","+$("#_p_object_transform_origin_y").val()/100};
			$("#"+_id_layer_current).css(transform_css);
			var style_obj={'origin_x':$("#_p_object_transform_origin_x").val()/100,'origin_y':$("#_p_object_transform_origin_y").val()/100};
			frame_style_save(style_obj);
		}
	});
	//border
	$("#_p_object_border_width,#_p_object_border_color").focusout(function(){
		$("#_p_object_border_width,#_p_object_border_color").blur().removeClass("value_edit")
		var p_value=$("#_p_object_border_width").val()*1;
		if(_id_layer_current!=""){
			handle_frame_border();
		}
	});
	
	//border-radius
	$("#_p_object_border_radius").focusout(function(){
		$("#_p_object_border_radius").blur().removeClass("value_edit")
		var p_value=$("#_p_object_border_radius").val()*1;
		if(_id_layer_current!=""){
			$("#"+_id_layer_current).css({'border-radius':p_value})
			frame_style_save({'border_radius':p_value});
		}
	});
	
	//custom style
	$("#_p_object_custom").focusout(function(){
		$("#_p_object_custom").blur().removeClass("value_edit")
		var p_value=$("#_p_object_custom").val();
		if(_id_layer_current!=""){
			for(var i=0;i<layer_data.length;i++){
				if(layer_data[i].id==$(_object_canvas_item._dragElement).attr("id")){
					var frame_item_data=layer_data[i].frame.data;
					for(var j=0;j<frame_item_data.length;j++){
						if(frame_item_data[j].id==_id_frame_current){
							frame_item_data[j].custom_style=p_value;
						}
					}
				}
			}
			canvas_item_current_set(_id_layer_current);
		}
	});
}

function handle_frame_border(){
	var border_color=$("#_p_object_border_color").val();
	var border_width=$("#_p_object_border_width").val();
	var border_type=$("#_p_border_type").html();
	console.log(border_type);
	if(border_type!="none" && border_width!="0"){
		border_type=$("#_p_border_type i").attr('class').replace('ico_border_type_','');
		$('#'+_id_layer_current).css({'border':border_color+" "+border_width+"px "+border_type});
		frame_style_save({'border_color':border_color,'border_width':border_width,'border_type':border_type});
	}
	else{
		frame_style_del({'border_color':'','border_width':'','border_type':''});
		$('#'+_id_layer_current).css({'border':0});
	}
}

/*帧变化，重置属性面板值*/
function property_reset(t){
	/*
	if(_id_layer_current!=null && _id_layer_current!=""){
		$("#property_layer,#property_animation").show();
	}
	else{
		console.log("hide");
		$("#property_layer,#property_animation").hide();
	}
	
	if(_object_canvas_item!=null && _object_canvas_item!=""){
		$("#property_frame,#property_transform,#property_border,#property_custom").show();
	}
	else{
		console.log("hide");
		$("#property_frame,#property_transform,#property_border,#property_custom").hide();
	}
	*/


	if(t==0){
		$("#_p_layer_name").val('');
		$("#_p_layer_id").html('');
		$("#_p_frame_time").val('');
		$("#_p_object_opacity").val("");
		$("#_p_frame_function").text("Ease");
		$("#_p_object_width").text("");
		$("#_p_object_height").text("");
		$("#_p_object_x").text("");
		$("#_p_object_y").text("");
		$("#_p_layer_iteration").val("1");
		$("#_p_object_border_color_show").css({'background':'#00A5FF'});
		$("#_p_object_border_color").val("#00A5FF");
		$("#_p_object_border_width").val("1");
		$("#_p_border_type").html("none");
		$("#_p_object_border_radius").val("");
		$("#_p_object_custom").val('');
		
		$("#_p_object_x,#_p_object_y,#_p_object_translate_x,#_p_object_translate_y,#_p_object_translate_z,#_p_object_width,#_p_object_height,#_p_object_rotate,#_p_object_rotate_x,#_p_object_rotate_y,#_p_object_skew,#_p_object_transform_origin_x,#_p_object_transform_origin_y,#_p_object_scale_x,#_p_object_scale_y,#_p_object_perspective").val('');
		
		$("#_p_animation_iteration").val('');
		$("#_p_animation_time_function").html('&nbsp;');
		$("#_p_layer_custom").val('');
		$("#_p_animation_direction").html('&nbsp;');
		$("#border_ct").hide();
		return;
	}

	for(var i=0;i<layer_data.length;i++){
		
		if(layer_data[i].id==_id_layer_current){
			if(layer_data[i].iteration!=undefined)$("#_p_layer_iteration").val(layer_data[i].iteration);
			$("#_p_layer_name").val(layer_data[i].name);
			$("#_p_layer_id").html(layer_data[i].id);
			
			var layer_style=$.evalJSON(layer_data[i].style);
			if(layer_style.top!=undefined)$("#_p_object_x").val(layer_style.left.replace("px",""));
			else $("#_p_object_x").val("0");
			if(layer_style.left!=undefined)$("#_p_object_y").val(layer_style.top.replace("px",""));
			else $("#_p_object_y").val("0");
			
			if(layer_data[i].custom!=undefined)$("#_p_layer_custom").val(layer_data[i].custom);
			else $("#_p_layer_custom").val("");
			if(layer_style.animation_timing_function!=undefined)$("#_p_animation_time_function").html(layer_style.animation_timing_function);
			else $("#_p_animation_time_function").html("Ease");
			if(layer_style.animation_iteration!=undefined)$("#_p_animation_iteration").val(layer_style.animation_iteration);
			else $("#_p_animation_iteration").val("infinite");
			if(layer_style.animation_direction!=undefined)$("#_p_animation_direction").html(layer_style.animation_direction);
			else $("#_p_animation_direction").html("normal");

			
			var frame_data=layer_data[i].frame.data;
			for(var j=0;j<frame_data.length;j++){
				if(frame_data[j].id==_id_frame_current){
					var frame_style=$.evalJSON(frame_data[j].style);
					
					$("#_p_frame_time").val(frame_data[j].time);
				
					if(frame_style.opacity!=undefined)$("#_p_object_opacity").val(frame_style.opacity*100);
					else $("#_p_object_opacity").val("100");
					
					if(frame_style.AnimationTimingFunction!=undefined)$("#_p_frame_function").text(frame_style.AnimationTimingFunction);
					else $("#_p_frame_function").text("Ease");
					
					if(frame_style.width!=undefined)$("#_p_object_width").val(frame_style.width.replace("px",""));
					if(frame_style.height!=undefined)$("#_p_object_height").val(frame_style.height.replace("px",""));
					
					
					if(frame_style.translate_x!=undefined)$("#_p_object_translate_x").val(frame_style.translate_x);
					else $("#_p_object_translate_x").val("0");
					if(frame_style.translate_y!=undefined)$("#_p_object_translate_y").val(frame_style.translate_y);
					else $("#_p_object_translate_y").val("0");
					if(frame_style.translate_z!=undefined)$("#_p_object_translate_z").val(frame_style.translate_z);
					else $("#_p_object_translate_z").val("0");
					if(frame_style.rotate!=undefined)$("#_p_object_rotate").val(frame_style.rotate);
					else $("#_p_object_rotate").val("0");
					if(frame_style.rotate_x!=undefined)$("#_p_object_rotate_x").val(frame_style.rotate_x);
					else $("#_p_object_rotate_x").val("0");
					if(frame_style.rotate_y!=undefined)$("#_p_object_rotate_y").val(frame_style.rotate_y);
					else $("#_p_object_rotate_y").val("0");
					if(frame_style.skew!=undefined)$("#_p_object_skew").val(frame_style.skew);
					else $("#_p_object_skew").val("0");
					if(frame_style.scale_x!=undefined)$("#_p_object_scale_x").val(frame_style.scale_x*100);
					else $("#_p_object_scale_x").val("100");
					if(frame_style.scale_y!=undefined)$("#_p_object_scale_y").val(frame_style.scale_y*100);
					else $("#_p_object_scale_y").val("100");
					
					if(frame_style.origin_x!=undefined)$("#_p_object_transform_origin_x").val(frame_style.origin_x*100);
					else $("#_p_object_transform_origin_x").val("100");
					if(frame_style.origin_y!=undefined)$("#_p_object_transform_origin_y").val(frame_style.origin_y*100);
					else $("#_p_object_transform_origin_y").val("100");
					
					if(frame_style.perspective!=undefined)$("#_p_object_perspective").val(frame_style.perspective);
					else $("#_p_object_perspective").val("0");
					
					if(frame_style.border_width!=undefined)$("#_p_object_border_width").val(frame_style.border_width);
					else $("#_p_object_border_width").val("1");
					if(frame_style.border_color!=undefined){
						$("#_p_object_border_color_show").css({'background':frame_style.border_color});
						$("#_p_object_border_color").val(frame_style.border_color);
					}
					else{
						$("#_p_object_border_color_show").css({'background':'#00A5FF'});
						$("#_p_object_border_color").val("#00A5FF");
					}
					
					$("#border_ct").show();
					if(frame_style.border_type!=undefined && frame_style.border_type!="none")$("#_p_border_type").html("<i class=\"ico_border_type_"+frame_style.border_type+"\"></i>");
					else $("#_p_border_type").html("none");
					
					if(frame_style.border_radius!=undefined)$("#_p_object_border_radius").val(frame_style.border_radius);
					else $("#_p_object_border_radius").val("0");
					
					if(frame_data[j].custom_style!="")$("#_p_object_custom").val(frame_data[j].custom_style);
					else $("#_p_object_custom").val("");
				}
			}
		}
	}
}

/*显示素材库*/
function lib_show(){
	var data_area=[];
	data_area.push([ "id" , project_info.id ]);
	var data_str=requestToString(data_area);
	$.ajax({
		url:cgipath + 'image-showlist',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("加载文件列表失败！");},
		success:function(feedback){
			if(feedback.ret=="0"){
				var img_list=feedback.img_list;
				var img_html="";
				for(var i=0;i<img_list.length;i++){
					img_html+="<div class=\"item\" title=\""+img_list[i].name+"\" draggable=\"true\" data='"+$.toJSON(img_list[i])+"' style=\"height:"+img_list[i].thumb_height+"px;width:"+img_list[i].thumb_width+"px;background:url(server/project/"+project_info.id+"/"+img_list[i].thumb_name+") no-repeat center top;\">"
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
	$("#side_right")[0].ondragenter =function(){event.stopPropagation(); event.preventDefault();};
	$("#side_right")[0].ondragover =function(){event.stopPropagation(); event.preventDefault();};
	$("#side_right")[0].ondrop =function(){event.stopPropagation(); event.preventDefault();imgDrop(event)};

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

					img_data.push({'name':aFile.name,'data':e.target.result});
					if(img_data.length==files.length){
						var data_area=[];
						data_area.push([ "img_data" , $.toJSON(img_data) ]);
						data_area.push([ "id" , project_info.id ]);
						var data_str=requestToString(data_area);
						$.ajax({
							url:cgipath + 'image-upload',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("上传文件失败！");},
							success:function(feedback){
								lib_show();
								
								$("#tab_area").find("a").removeClass("current");
								$("#btn_lib").addClass("current");
								$(".side_tab").hide();
								$("#tab_lib").show();
								$("#upload_file_watermark").show();
		
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
			//ev.dataTransfer.effectAllowed = "move";
			ev.dataTransfer.setData("text", $(ev.target).attr("data"));
			ev.dataTransfer.setDragImage(ev.target, 0, 0);
			return true;
		};
		drag_arr[i].ondragend = function(ev) {
			$("#rabbish_area").removeClass('rabbish_area_show');
			return true;
		};
	}
}

/*加载特效库*/
var effect_data=[];
function effect_init(){
	$.ajax({
		url:'effect.txt',type:'GET',data:'',dataType:'json',timeout: ajax_timeout,error:function () {},
		success:function(feedback){
			effect_data=feedback;
			var effect_html="";
			for(var i=0;i<feedback.length;i++){
				effect_html+="<h3 class=\"effect_title\" title=\""+feedback[i].name_eng+"\">"+feedback[i].name+"</h3>";
				for(var j=0;j<feedback[i].data.length;j++){
					effect_html+="<a class=\"butt\"  title=\""+feedback[i].data[j].name_eng+"\" onclick=\"effect_set("+i+","+j+")\">"+feedback[i].data[j].name+"</a>";
				}
			}
			$("#effect_list").html(effect_html);
		}
	});
}


function effect_set(t1,t2){
	if(_id_layer_current==null){
		 message.show("message_div","提示","未选择图层",4);
		 return;
	}
	for(var i=0;i<layer_data.length;i++){
		if(layer_data[i].id==_id_layer_current){
			layer_data[i].frame.data=[];
			layer_data[i].frame.count=effect_data[t1].data[t2].frame.length;
			for(var j=0;j<effect_data[t1].data[t2].frame.length;j++){
				effect_data[t1].data[t2].frame[j].style.width=layer_data[i].img.width+"px";
				effect_data[t1].data[t2].frame[j].style.height=layer_data[i].img.height+"px";
				layer_data[i].frame.data.push({"custom_style": "",id: "frame_item_"+j,style:$.toJSON(effect_data[t1].data[t2].frame[j].style),time: effect_data[t1].data[t2].frame[j].time});
				
			}
		}
	}
	project_repaint();
	effect_preview(_id_layer_current);
}

function effect_preview(layer_id){
	canvas_item_reset();
	var frame_style=frame_compute(layer_id);
	$("#canvas_animation_style").html(frame_style);
	$("#canvas_range").removeClass("canvas_range_play").addClass("canvas_range_play");
	$("#canvas_range").removeClass("canvas_range_pause");
	setTimeout("effect_preview_stop();",1000);
	canvas_item_current_set(layer_id)
}

function effect_preview_stop(){
	$("#canvas_animation_style").html('');
	$("#canvas_range").removeClass("canvas_range_play").removeClass("canvas_range_pause");
}

/*设置不可拖放区域*/
function drag_disable(){
	$(document).bind('dragover',function(ev) {
		ev.preventDefault();
		return false;
	});
	$(document).unbind('dragover').unbind('dragleave').unbind('click').unbind('dragenter').unbind('drog');
	$(document).unbind('drop');
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
	$("#mod_nav").bind('dragover',function(ev) {
		ev.preventDefault();
		return false;
	});
	
}


/*设置图片为画板背景*/
function canvas_bg_init(){
	$("#canvas_bg_set")[0].ondragover = function(ev) {/*拖拽元素在目标元素头上移动的时候*/
		return true;
	};

	$("#canvas_bg_set")[0].ondragenter = function(ev) {/*拖拽元素进入目标元素头上的时候*/
		//$(this).addClass("canvas_bg_set_hover");
		return true;
	};
	$("#canvas_bg_set")[0].ondragleave = function(ev) {/*拖拽元素进入目标元素头上的时候*/
		//$(this).removeClass("canvas_bg_set_hover");
		return true;
	};
	$("#canvas_bg_set")[0].ondrop = function(ev) {/*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
		//$(this).removeClass("canvas_bg_set_hover");
		$(this).hide();
		data= $.evalJSON(ev.dataTransfer.getData('text'));
		if(data.width==undefined)return;
		canvas_data.background_image=data.name;
		var img_src="server/project/"+project_info.id+"/"+data.name;
		
		canvas_data.width=data.width;
		canvas_data.height=data.height;
		canvas_data.background_image=data.name;
		show_canvas();
		$("#canvas_range").css({'backgroundImage':'url('+img_src+')'});
		$("#_p_canvas_width").val(canvas_data.width);
		$("#_p_canvas_height").val(canvas_data.height);
		$("#_p_canvas_bg_img").text(data.name);
		$("#canvas_bg_del").show();
		ev.stopPropagation(); 
		ev.preventDefault();
		return false;
	};
	$("#canvas_bg_del").click(function(){
		$(this).hide();
		$("#_p_canvas_bg_img").text("");
		canvas_data.background_image="";
		$("#canvas_range").css({'backgroundImage':''});
	});
}

/*垃圾箱*/
function rabbish_init(){
	
	$("#rabbish_area,#rabbish_layer_area").each(function(){
		$(this)[0].ondragover=function(ev) {
			ev.preventDefault();
			return true;
		}
	});

	$("#rabbish_area,#rabbish_layer_area").each(function(){
		$(this)[0].ondragenter=function(ev) {
		$(this).addClass("rabbish_area_hover");
		return true;
		}
	})

	$("#rabbish_area,#rabbish_layer_area").each(function(){
		$(this)[0].ondragleave=function(ev) {
			$(this).removeClass("rabbish_area_hover");
			return true;
		}
	});
	
	//删除图片
	$("#rabbish_area")[0].ondrop = function(ev) {/*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
		$(this).removeClass("rabbish_area_hover");
		var data_area=[];
		data= $.evalJSON(ev.dataTransfer.getData('text'));
		data_area.push([ "name" , data.name ]);
		data_area.push([ "id" , project_info.id ]);
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
	
	//删除图层
	$("#rabbish_layer_area")[0].ondrop = function(ev) {
		$(this).removeClass("rabbish_area_hover");
		var layer_id=ev.dataTransfer.getData('text');
		layer_del(layer_id);
		return false;
	};
}


/*************************属性面板区域 end****************************/

/*************************快捷键 start****************************/
function key_handle(){
	$(document).keydown(function(event){	
		var keycode=event.keyCode;
		if(_flag_text_edit)return;	
		switch(keycode){
			case 46://删除
				frame_item_del();
				break;
				
				
			default:
				break;
		}
	});
}



/*************************快捷键 end****************************/


/*************************项目函数 start****************************/
var project={
	read:function(id){
		var data_area=[];
		data_area.push([ "id" , id ]);
		var data_str=requestToString(data_area);
		$.ajax({
			url:cgipath + 'project-read',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("保存失败！");},
			success:function(feedback){
				if(feedback.ret=="0"){
					project_init(feedback.info,feedback.data);
				}
				else{
					
				}
			}
		});
	
	},
	save:function(){
		var d=new Date();
		project_info.time_save=Math.floor(d.getTime()/1000);;
		$("#_p_project_time_save").text(time_to_local(project_info.time_save));
		
		var project_data={"project_info":project_info,"time_scale_data":time_scale_data,"canvas_data":canvas_data,"layer_data":layer_data};
		project_data=$.toJSON(project_data);

		var data_area=[];
		data_area.push([ "project_data" , project_data ]);
		data_area.push([ "id" , project_info.id ]);
		var data_str=requestToString(data_area);
		$.ajax({
			url:cgipath + 'project-save',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {alert("保存失败！");},
			success:function(feedback){
				if(feedback.ret=="0"){
					$('#frame_window').css({'width':1000,'margin-top':-240,'margin-left':-500});
					$('#app_canvas_frame').addClass('frame_show');
					$('#app_canvas_frame').attr('src','result.htm?'+project_info.id);
					$('.frame_window_area').show();
				}
				else{
					
				}
			}
		});
	
	}

}

//打开项目
function project_open(t){
	frame_close();
	project.read(t);
}

//项目初始化
function project_init(info,data){
	project_info=info;
	canvas_data={};
	project_info={};
	layer_data=[];
	time_scale_data=time_scale_data={"count":50,"margin":100,"interval":0.5}
	if(data.canvas_data!=undefined)canvas_data=data.canvas_data;
	if(data.project_info!=undefined)project_info=data.project_info;
	if(data.layer_data!=undefined)layer_data=data.layer_data;
	if(data.time_scale_data!=undefined)time_scale_data=data.time_scale_data;
	
	project_reload();
}

//项目重新加载
function project_reload(){
	show_time_scale(1);
	project_info_show();
	show_coordinate();
	layer_init(1);
	canvas_item_init();
	frame_item_show(1);
	frame_init();
	lib_show();
}

//项目重绘
function project_repaint(){
	show_time_scale(1);
	layer_init(1);
	canvas_item_init();
	frame_item_show(1);
	frame_init();
}

//显示项目基本信息
function project_info_show(){
	$("#_p_canvas_width").val(canvas_data.width);
	$("#_p_canvas_height").val(canvas_data.height);
	$("#_p_canvas_bg_show").css({'background-color':canvas_data.background_color});
	$("#_p_canvas_bg").val(canvas_data.background_color);
	if(canvas_data.background_image!=""){
		$("#_p_canvas_bg_img").text(canvas_data.background_image);
		$("#canvas_bg_del").show();
	}
	
	$("#_p_project_author").text(project_info.author);
	$("#_p_project_time_create").text(time_to_local(project_info.time_add));
	$("#_p_project_time_save").text(time_to_local(project_info.time_save));
}

/*************************项目函数 end****************************/

var skill_data;
var skill_index=0;
function skill_init(){
	$("#tip_skill #tip_close").click(function(){
		$("#tip_skill").hide();
	});
	$("#tip_skill #tip_next").click(function(){
		skill_show();
	});
	$.ajax({
		url:'skill.txt',type:'GET',data:'',dataType:'json',timeout: ajax_timeout,error:function () {},
		success:function(feedback){
			skill_data=feedback;
		}
	});

}

function skill_show(){return;
	var skill=skill_data[skill_index];
	$("#tip_skill").css({"left":skill.left,"top":skill.top});
	$("#tip_skill .skill_content").text(skill.text);
	$("#tip_skill").attr("class","tip_skill "+skill.type);
	$("#tip_skill").show();
}


	 
/******************************
 **********弹框组件**********
 _obj_id:弹框div，已废除
 _title:标题
 _content:内容
 _type:弹框类型
 1确认按钮
 2确认+取消按钮
 3 无按钮，成功提示，自动消失
 4 无按钮，失败提示，自动消失
 5 无按钮，警告提示，自动消失

 _width:弹框宽度
 _callback:确定按钮回调函数(字符串)

 示例
 message.show("message_div","提示","确实要删除吗？",2,"","project.del(123);")

 ******************************/
var message = {
    obj_id:"message_div",
    title:"提示",
    content:"无内容",
    type:1,
    width:376,
    callback:"message.close();",

    //默认显示对话框
    show:function (_obj_id, _title, _content, _type, _width, _callback) {
        this.obj_id = _obj_id || "message_div";
        this.title = _title || "提示";
        this.content = _content || "无内容";
        this.type = _type || 1;
        this.width = _width || 376;
        this.callback = _callback + ";message.close()";
        //this.callback += ";message.close();";


        var ret = "<div id=\"qam_message_area\">";

        if (this.type == 1 || this.type == 2) {
            ret += "<div class=\"qam_message_mask\"></div>";//遮罩层
            ret += "<div id=\"qam_popup_box\" class=\"qam_popup\" style=\"width:" + this.width + "px;margin-left:-" + this.width / 2 + "px;\"><div class=\"qam_popup_inner\">";
            ret += "<div class=\"qam_popup_hd\"><div class=\"qam_popup_hd_inner\"><h3>" + this.title + "</h3><a href=\"javascript:void(0)\" onclick=\"message.close()\" class=\"ico_x\"></a></div></div>";
            ret += "<div class=\"qam_popup_bd\">" + this.content + "</div>";
            ret += "<div class=\"qam_popup_ft\"><div class=\"global_tip_button\">";
            if (this.type == 1 || this.type == 2)ret += "<a class=\"bt_tip_hit\" title=\"确定\" href=\"javascript:void(0)\" onclick=\"" + this.callback + "\">确定</a>";
            if (this.type == 2)ret += "<a class=\"bt_tip_normal\" title=\"取消\" href=\"javascript:void(0)\" onclick=\"message.close()\">取消</a>";
            ret += "</div></div></div></div>";
        }
        else if (this.type == 3 || this.type == 4 || this.type == 5) {
            ret += "<div id=\"qam_msgbox\" class=\"qam_msgbox_layer_wrap\"><span class=\"qam_msgbox_layer\">";
            if (this.type == 3)ret += "<span class=\"gtl_ico_succ\"></span>";
            else if (this.type == 4)ret += "<span class=\"gtl_ico_fail\"></span>";
            else if (this.type == 5)ret += "<span class=\"gtl_ico_hits\"></span>";
            ret += this.content;
            ret += "<span class=\"gtl_end\"></span></span></div>";
        }
        ret += "</div>";

        if (typeof($("#qam_message_area") == "object")) {
            $("#qam_message_area").remove();
        }

        $(document.body).append(ret);

        if (this.type == 1 || this.type == 2) {
            $("#qam_popup_box").css("top", $(window).height() / 2 + $(parent).scrollTop() - 100);
        }
        else if (this.type == 3 || this.type == 4 || this.type == 5) {
            setTimeout(function () {
                eval(message.callback);
            }, 1500);
        }

    },

    close:function () {
        $("#qam_message_area").remove();
    }

}


/**********************公用函数 start **********************/
function ajax_timeout(){}

//判断值是否在数组中，值可以是int或str等类型
function In_array(str,obj){
	var ret=false;
	for(var i=0;i<obj.length;i++){
		if(obj[i]==str){
			ret=true;
			break;
		}
	}
	return ret;
}

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

//时间戳转本地时间
function time_to_local(t){
	if(t>0){
		var d= new Date(parseInt(t) * 1000);
		return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+" "+int_to_decade(d.getHours())+":"+int_to_decade(d.getMinutes()); 
	}
	else
		return "";
}
//数字保持为2位(加0)
function int_to_decade(t){
	t=t*1;
	if(t<10)t="0"+t;
	return t+"";
}

function frame_resize(){
	$('.app_canvas_frame').css({'height':100});
	$('.app_canvas_frame').css({'height':$('.app_canvas_frame').contents().find("html").height()});
}

function frame_close(){
	$('.frame_window_area').hide();
}


/**********************公用函数 end**********************/












