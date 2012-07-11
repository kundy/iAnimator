
function Transform_Adjust(el){
  _this_Transform=this;
  this._startX = 0;            // mouse starting positions
  this. _startY = 0;
  this. _offsetX = 0;           // current element offset
  this. _offsetY = 0;
  this._width = 0;
  this._height = 0;
  this._transform={};
  this._dragElement = el;      // needs to be passed from OnMouseDown to OnMouseMove
  this._oldZIndex = 0;         // we temporarily increase the z-index during drag
  this._type=0;//0:位置top left 1:大小 width height 2:伸缩 scale 3:倾邪skew  4旋转rotate
  
}


Transform_Adjust.prototype = {
    init : function(){
		_this_Transform._dragElement.onselectstart = function () { return false; };
		_this_Transform._dragElement.ondragstart = function() { return false; };
		
		$(_this_Transform._dragElement).append("<i class=\"skew\" title=\"倾斜度调整\"></i>");
		$(_this_Transform._dragElement).append("<i class=\"resize\" title=\"大小调整\"></i>");
		$(_this_Transform._dragElement).append("<i class=\"rotate\" title=\"旋转角度调整\"></i>");
		$(_this_Transform._dragElement).append("<i class=\"pos\" title=\"绝对位置调整，所有帧的位置会一起变化\"></i>");

		$(_this_Transform._dragElement).click(function(e){e.stopPropagation();	});
		$(_this_Transform._dragElement).find(".pos").mousedown(this.onMouseDown_pos);
		$(_this_Transform._dragElement).find(".resize").mousedown(this.onMouseDown_resize);
		$(_this_Transform._dragElement).find(".skew").mousedown(this.onMouseDown_skew);
		$(_this_Transform._dragElement).find(".rotate").mousedown(this.onMouseDown_rotate);
	},
	remove:function(){
		//console.log('Transform_Adjust remove');
		//$(_this_Transform._dragElement).unbind('mousedown');
		$(_this_Transform._dragElement).find(".resize").remove();
		$(_this_Transform._dragElement).find(".skew").remove();
		$(_this_Transform._dragElement).find(".rotate").remove();
		$(_this_Transform._dragElement).find(".pos").remove();
	},
	onMouseDown_move: function(e){
		
		var even = e ? e : window.event;
		//console.log('onMouseDown_move');
		if(e.button == 1 || e.button == 0){
			_this_Transform._startX = even.clientX;
			_this_Transform._startY = even.clientY;
			_this_Transform._transform=_this_Transform.parseTransform($(_this_Transform._dragElement)[0].style.WebkitTransform);
			_this_Transform._offsetX = _this_Transform._transform.translate_x;
			_this_Transform._offsetY = _this_Transform._transform.translate_y;
			$(document).mousemove(_this_Transform.onMouseMove_move);
			$(document).mouseup(_this_Transform.onMouseUp_move);
			return false;
		}
	},
	onMouseMove_move: function(e){
		//console.log('onMouseMove_pos');
		var e = e ? e : window.event;

		_this_Transform._transform.translate_x = (_this_Transform._offsetX + e.clientX - _this_Transform._startX);
		_this_Transform._transform.translate_y = (_this_Transform._offsetY + e.clientY - _this_Transform._startY);
		var transform_css={"-webkit-transform":"translate("+_this_Transform._transform.translate_x+"px,"+_this_Transform._transform.translate_y+"px) skew("+_this_Transform._transform.skew+"deg) scale("+_this_Transform._transform.scale_x+","+_this_Transform._transform.scale_y+") rotate("+_this_Transform._transform.rotate+"deg) "};
		$(_this_Transform._dragElement).css(transform_css);
		_this_Transform._dragElement.style.cursor ="move";
		
	},
	onMouseUp_move: function(e){
		//console.log('onMouseUp_move');
		$(_this_Transform._dragElement).unbind("mousemove");
		$(_this_Transform._dragElement).unbind("mouseup");
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");
		frame_style_save(_this_Transform._transform);
		property_reset();
		//_dragElement.onmousemove = null;
	},
	
	onMouseDown_pos: function(e){
		
		var even = e ? e : window.event;
		//console.log('onMouseDown_move');
		if(e.button == 1 || e.button == 0){
			_this_Transform._startX = even.clientX;
			_this_Transform._startY = even.clientY;
			_this_Transform._offsetX = _this_Transform.parseMumber($(_this_Transform._dragElement).css('left'));
			_this_Transform._offsetY = _this_Transform.parseMumber($(_this_Transform._dragElement).css('top'));
			_this_Transform._oldZindex = _this_Transform._dragElement.style.zIndex;
			$(document).mousemove(_this_Transform.onMouseMove_pos);
			$(document).mouseup(_this_Transform.onMouseUp_pos);
			return false;
		}
	},
	onMouseMove_pos: function(e){
		//console.log('onMouseMove_move');
	  var e = e ? e : window.event;
	  _this_Transform._dragElement.style.left = (_this_Transform._offsetX + e.clientX - _this_Transform._startX) + 'px';
	  _this_Transform._dragElement.style.top = (_this_Transform._offsetY + e.clientY - _this_Transform._startY) + 'px';
	  _this_Transform._dragElement.style.cursor ="move";
	
	},
	onMouseUp_pos: function(e){
		//console.log('onMouseUp_pos');
		$(_this_Transform._dragElement).unbind("mousemove");
		$(_this_Transform._dragElement).unbind("mouseup");
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");
		layer_style_save({'left':$(_this_Transform._dragElement).css('left'),'top':$(_this_Transform._dragElement).css('top')});
		property_reset();
		//_dragElement.onmousemove = null;
	},
	
	onMouseUp: function(e){
		//console.log('onMouseUp');
		$(_this_Transform._dragElement).unbind("mousemove");
		$(_this_Transform._dragElement).unbind("mouseup");
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");
		_this_Transform._transform=_this_Transform.parseTransform($(_this_Transform._dragElement)[0].style.WebkitTransform);
		frame_style_save(_this_Transform._transform);
		property_reset();
		//_dragElement.onmousemove = null;
	},
	
	
	
	onMouseDown_resize: function(e){
		var even = e ? e : window.event;
		//console.log('onMouseDown');
		if(e.button == 1 || e.button == 0){
			_this_Transform._startX = even.clientX;
			_this_Transform._startY = even.clientY;
			_this_Transform._width = $(_this_Transform._dragElement).width();
			_this_Transform._height = $(_this_Transform._dragElement).height();
			
			$(document).mousemove(_this_Transform.onMouseMove_resize);
			$(document).mouseup(_this_Transform.onMouseUp);

			return false;
		}
	},
	onMouseMove_resize: function(e){
		//console.log('onMouseMove_resize');
	      var e = e ? e : window.event;
		_this_Transform._dragElement.style.width = (_this_Transform._width + e.clientX - _this_Transform._startX) + 'px';
		_this_Transform._dragElement.style.height = (_this_Transform._height + e.clientY - _this_Transform._startY) + 'px';
		frame_style_save({'width':$(_this_Transform._dragElement).css('width'),'height':$(_this_Transform._dragElement).css('height')});
		property_reset();
		//$(_dragElement).find("img")[0].style.width=(_width + e.clientX - _startX) + 'px';
		//$(_dragElement).find("img")[0].style.height=(_height + e.clientY - _startY) + 'px';
	},

	
	onMouseDown_skew: function(e){
		var even = e ? e : window.event;
		//console.log('onMouseDown');
		if(e.button == 1 || e.button == 0){
			_this_Transform._startX = even.clientX;
			_this_Transform._startY = even.clientY;
			_this_Transform._width = $(_this_Transform._dragElement).width();
			_this_Transform._height = $(_this_Transform._dragElement).height();
			
			_this_Transform._transform=_this_Transform.parseTransform($(_this_Transform._dragElement)[0].style.WebkitTransform);

			$(document).mousemove(_this_Transform.onMouseMove_skew);
			$(document).mouseup(_this_Transform.onMouseUp);

			return false;
		}
	},
	onMouseMove_skew: function(e){
		//console.log('onMouseMove_resize');
	    var e = e ? e : window.event;
		var skew=Math.round(Math.atan((_this_Transform._startX-e.clientX)/_this_Transform._height)*180/Math.PI);
		if(skew<0)skew=180+skew;
		skew=_this_Transform._transform.skew*1+skew;
		var transform_css={"-webkit-transform":"translate("+_this_Transform._transform.translate_x+"px,"+_this_Transform._transform.translate_y+"px) skew("+skew+"deg) scale("+_this_Transform._transform.scale_x+","+_this_Transform._transform.scale_y+") rotate("+_this_Transform._transform.rotate+"deg) "};
		 $(_this_Transform._dragElement).css(transform_css);
	},

	onMouseDown_rotate: function(e){
		var even = e ? e : window.event;
		//console.log('onMouseDown');
		if(e.button == 1 || e.button == 0){
			_this_Transform._startX = even.clientX;
			_this_Transform._startY = even.clientY;
			_this_Transform._transform=_this_Transform.parseTransform($(_this_Transform._dragElement)[0].style.WebkitTransform);
			_this_Transform._offsetX = _this_Transform.parseMumber(_this_Transform.getLeft(_this_Transform._dragElement))+_this_Transform._transform.translate_x;
			_this_Transform._offsetY = _this_Transform.parseMumber(_this_Transform.getTop(_this_Transform._dragElement))+_this_Transform._transform.translate_y;;
			
			_this_Transform._width = $(_this_Transform._dragElement).width();
			_this_Transform._height = $(_this_Transform._dragElement).height();
			
			

			$(document).mousemove(_this_Transform.onMouseMove_rotate);
			$(document).mouseup(_this_Transform.onMouseUp);

			return false;
		}
	},
	onMouseMove_rotate: function(e){
		//console.log('onMouseMove_resize');
	    var e = e ? e : window.event;
		var base_x=_this_Transform._offsetX+_this_Transform._width/2;
		var base_y=_this_Transform._offsetY+_this_Transform._height/2;
		//_dragElement.style.width = (_width + e.clientX - _startX) + 'px';
		var rotate=Math.round(Math.atan(-1*(e.clientY-base_y)/(e.clientX-base_x))*180/Math.PI);
		
		if(e.clientX-base_x<0)rotate+=180;
		if(e.clientX-base_x>0 && e.clientY-base_y>0)rotate+=360;
		
		var rotate2=Math.round(Math.atan(_this_Transform._height/_this_Transform._width)*180/Math.PI);
		rotate2+=180;
		rotate=(rotate-rotate2)*-1;
		
		var transform_css={"-webkit-transform":"translate("+_this_Transform._transform.translate_x+"px,"+_this_Transform._transform.translate_y+"px) skew("+_this_Transform._transform.skew+"deg) scale("+_this_Transform._transform.scale_x+","+_this_Transform._transform.scale_y+") rotate("+rotate+"deg) "};
		 $(_this_Transform._dragElement).css(transform_css);
	},

	
	
	
	parseMumber: function(value){	
    	var n = parseInt(value);
    	return isNaN(n) ? 0 : n;		
	},
	
	parseTransform:function(str){
		var skew=0;
		var scale_x=1;
		var scale_y=1;
		var rotate=0;
		var translate_x=0;
		var translate_y=0;
		try{
			skew=str.match(/skew\((.*?)deg\)/i)[1]*1;
			rotate=str.match(/rotate\((.*?)deg\)/i)[1]*1;
			var scale_xy=str.match(/scale\((.*?)\)/i)[1].split(',');
			scale_x=scale_xy[0]*1;
			scale_y=scale_xy[1]*1;
			var translate_xy=str.match(/translate\((.*?)\)/i)[1].split(',');
			translate_x=translate_xy[0].replace('px','')*1;
			translate_y=translate_xy[1].replace('px','')*1;
		}catch(e){
			skew=0;
			scale_x=1;
			scale_y=1;
			rotate=0;
			translate_x=0;
			translate_y=0;
		}
		var ret={"skew":skew,"scale_x":scale_x,"scale_y":scale_y,"rotate":rotate,"translate_x":translate_x,"translate_y":translate_y};
		//console.log(ret);
		return(ret);
	},
	
	getTop:function(e){  
		var offset=e.offsetTop-e.scrollTop;  
		if(e.offsetParent!=null) offset+=this.getTop(e.offsetParent);  
		return offset;  
	},
	getLeft:function(e){  
		var offset=e.offsetLeft-e.scrollLeft;  
		if(e.offsetParent!=null) offset+=this.getLeft(e.offsetParent);  
		return offset;  
	}  
	
};


function Frame_Item_Adjust(el){
  _this_frame=this;
  this._startX = 0;            // mouse starting positions
  this._startY = 0;
  this._offsetX = 0;           // current element offset
  this._offsetY = 0;
  this._width = 0;
  this._height = 0;
  this._transform={};
  this._dragElement = el;      // needs to be passed from OnMouseDown to OnMouseMove
  this._oldZIndex = 0;         // we temporarily increase the z-index during drag
  this._type=0;//0:位置top left 1:大小 width height 2:伸缩 scale 3:倾邪skew  4旋转rotate
}


Frame_Item_Adjust.prototype = {
    init : function(){
		_this_frame._dragElement.onselectstart = function () { return false; };
		_this_frame._dragElement.ondragstart = function() { return false; };
		$(_this_frame._dragElement).click(function(e){e.stopPropagation();return false;});
		$(_this_frame._dragElement).dblclick(function(e){e.stopPropagation();return false;});
		//$(_this_frame._dragElement).unbind('mousedown').mousedown(this.onMouseDown);
		
	},
	
	remove:function(){
		$(_this_frame._dragElement).unbind('mousedown');
	},
	
	onMouseDown: function(e){
		$(".frame_item").removeClass("frame_item_current");
		$("#time_line").css({"left":$(_this_frame._dragElement).css("left").replace("px","")*1});
		canvas_item_current_set($(_this_frame._dragElement).parent().attr("layer_id"),$(_this_frame._dragElement).attr("item_id"));
		var even = e ? e : window.event;
		if(e.button == 1 || e.button == 0){
			_this_frame._startX = even.clientX;
			_this_frame._offsetX = _this_frame.parseMumber(_this_frame._dragElement.style.left);
			$(_this_frame._dragElement).addClass("frame_item_current");
			$(document).mousemove(_this_frame.onMouseMove);
			$(document).mouseup(_this_frame.onMouseUp);

			return false;
		}
	},
	onMouseMove: function(e){
		var even = e ? e : window.event;
		$("#time_line").css({"left":$(_this_frame._dragElement).css("left").replace("px","")*1+1});
	    var e = e ? e : window.event;
		var frame_left=_this_frame._offsetX + e.clientX - _this_frame._startX;
		if(frame_left<0)frame_left=0;
		else if(frame_left>3000-9)frame_left=3000-9;
	    _this_frame._dragElement.style.left =  frame_left+ 'px';
		
		var frame_line_info=get_timeline_info(even);
		frame_item_time_set($(_this_frame._dragElement).parent().attr("layer_id"),$(_this_frame._dragElement).attr("item_id"),frame_line_info.frame_time);
		//frame_bg_reset($(_dragElement).parent().attr("layer_id"));
		
	},
	onMouseUp: function(e){
		$(_this_frame._dragElement).unbind("mousemove");
		$(_this_frame._dragElement).unbind("mouseup");
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");
		//_dragElement.onmousemove = null;
	},
	parseMumber: function(value){	
    	var n = parseInt(value);
    	return isNaN(n) ? 0 : n;		
	}

	
};

