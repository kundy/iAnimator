/*********************************************************************************
 * animation 1.0 项目类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2012-4-5
***********************************************************************************/
var cgipath="server/index.php?";

function project_add_init(){
	$('#btn_project_add').click(function(){
		$('#prompt_text').text('');
		var project_name=$('#project_name').val();
		var canvas_width=$('#canvas_width').val();
		var canvas_height=$('#canvas_height').val();
		var project_author=$('#project_author').val();
		var project_privacy=1;
		if(!$('#project_privacy').is(":checked"))project_privacy=0;
		if(project_name==""){
			$('#prompt_text').text('项目名称不能为空');
			return;
		}
		var data_area=[];
		data_area.push([ "project_name" , project_name ]);
		data_area.push([ "canvas_width" , canvas_width ]);
		data_area.push([ "canvas_height" , canvas_height ]);
		data_area.push([ "project_author" , project_author ]);
		data_area.push([ "project_privacy" , project_privacy ]);
		var data_str=requestToString(data_area);
		project.add(data_str);
		
	});
}


var page_index=0;
var page_nums=10000;
var page_count=1;
var page_data;
var show_flag=1;//show_flag:1所有项目 2加精项目 3已删除项目
function project_show_list(obj){
	if(obj!=undefined)page_data=obj;
	
	page_count=Math.ceil(page_data.length/page_nums);
	var ul="";
	//for(var i=page_index*page_nums;i<page_index*page_nums+page_nums;i++){
	/*
		flag类型
			del_flag 		是否删除
			save_flag 		是否保存过
			perfect_flag 	是否加精
	*/
	for(var i=page_data.length-1;i>=0;i--){
		if(i<page_data.length){
			if(show_flag==1){
				if(page_data[i].saveflag!=undefined && page_data[i].saveflag==1 && page_data[i].del_flag!=1){
					var perfect_flag_temp=page_data[i].perfect_flag;
					if(perfect_flag_temp==undefined)perfect_flag_temp=0;
					
					if(page_data[i].perfect_flag!=1){
						ul+="<li>";
						ul+="<a target=\"_blank\" href=\"server/project/"+page_data[i].id+"/index.htm\"><i class=\"ico ico_preview\"></i></a>";
						ul+="<a onclick=\"parent.project_open("+page_data[i].id+")\" class=\"name\">"+page_data[i].name+"</a>";
						ul+="<span class=\"author\">"+page_data[i].author+"</span>";
						ul+="<span class=\"time\">"+getLocalTime(page_data[i].time_add)+"</span>";
						ul+="<span class=\"time\">"+getLocalTime(page_data[i].time_save)+"</span>";
						ul+="<a class=\"ico ico_good\" onclick=\"project_perfect_confirm("+page_data[i].id+")\"></a>";
						ul+="<a class=\"ico ico_close\" onclick=\"project_del_confirm("+page_data[i].id+")\"></a>";
						ul+="</li>";
					}
					
				}
			}
			else if(show_flag==2){
				if(page_data[i].saveflag!=undefined && page_data[i].saveflag==1 && page_data[i].del_flag!=1){
					var perfect_flag_temp=page_data[i].perfect_flag;
					if(perfect_flag_temp==undefined)perfect_flag_temp=0;
					
					if(page_data[i].perfect_flag==1){
						ul+="<li>";
						ul+="<a target=\"_blank\" href=\"server/project/"+page_data[i].id+"/index.htm\"><i class=\"ico ico_preview\"></i></a>";
						ul+="<a onclick=\"parent.project_open("+page_data[i].id+")\" class=\"name\">"+page_data[i].name+"</a>";
						ul+="<span class=\"author\">"+page_data[i].author+"</span>";
						ul+="<span class=\"time\">"+getLocalTime(page_data[i].time_add)+"</span>";
						ul+="<span class=\"time\">"+getLocalTime(page_data[i].time_save)+"</span>";
						ul+="<a class=\"ico ico_bad\" onclick=\"project_perfect_confirm("+page_data[i].id+")\"></a>";
						ul+="</li>";
					}
				}
			}
			else if(show_flag==3){
				if( (page_data[i].saveflag==undefined || page_data[i].del_flag==1 ) && page_data[i].del_flag!=2){
					var perfect_flag_temp=page_data[i].perfect_flag;
					if(perfect_flag_temp==undefined)perfect_flag_temp=0;
					
					ul+="<li>";
					ul+="<a target=\"_blank\" href=\"server/project/"+page_data[i].id+"/index.htm\"><i class=\"ico ico_preview\"></i></a>";
					ul+="<a onclick=\"parent.project_open("+page_data[i].id+")\" class=\"name\">"+page_data[i].name+"</a>";
					ul+="<span class=\"author\">"+page_data[i].author+"</span>";
					ul+="<span class=\"time\">"+getLocalTime(page_data[i].time_add)+"</span>";
					ul+="<span class=\"time\">"+getLocalTime(page_data[i].time_save)+"</span>";
					if(page_data[i].saveflag!=undefined)ul+="<a class=\"ico ico_resume\" onclick=\"project.resume("+page_data[i].id+")\" title=\"恢复\"></a>";
					ul+="<a class=\"ico ico_close\" onclick=\"project_del_real_confirm("+page_data[i].id+")\" title=\"彻底删除\"></a>";
					ul+="</li>";
				}
			}
		
			
		}
	}
	$("#project_list").html(ul);
	var page="";
	var page_class="";
	if(page_index==0)page_class="page_disable";
	page+="<a onclick=\"page_jump(-1)\" class=\""+page_class+"\">上一页</a>";
	page+="<span class=\"page_num\">"+(page_index+1)+"/"+page_count+"</span>";
	page_class="";
	if(page_index==page_count-1)page_class="page_disable";
	page+="<a onclick=\"page_jump(1)\"  class=\""+page_class+"\">下一页</a>";
	//$("#page_area").html(page);
	parent.frame_resize();
}

function project_perfect_confirm(id){
	if(show_flag==2)
		message.show("message_div","提示","确定要取消加精吗？",2,"","project.perfect("+id+")");
	else
		message.show("message_div","提示","确定要加精吗？",2,"","project.perfect("+id+")");
}


function project_del_confirm(id){
	message.show("message_div","提示","确定要删除吗？",2,"","project.del("+id+");")
}

function project_del_real_confirm(id){
	message.show("message_div","提示","确定要彻底删除吗？",2,"","project.delReal("+id+");")
}

function page_jump(t){
	if(t<0)page_index--;
	else if(t>0)page_index++;
	if(page_index<0)page_index=0;
	if(page_index>page_count-1)page_index=page_count-1;
	project_show_list();
}




function ajax_timeout(){}

jQuery.extend({
	evalJSON: function (strJson) {
		return eval("(" + strJson + ")");
	}
});

var project={
	showlist:function(flag){
		$.ajax({
			url:cgipath + 'project-showlist',type:'POST',data:'',dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					project_show_list(feedback.project_list.data);
				}
				else{
					
				}
			}
		});
	
	},
	add:function(data_str){
		$.ajax({
			url:cgipath + 'project-add',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					parent.project_open(feedback.id);
				}
				else{
					
				}
			}
		});
	},
	del:function(id){
		$.ajax({
			url:cgipath + 'project-del',type:'POST',data:"id="+id,dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					 message.show("message_div","提示","删除成功！",3)
				}
				else{
					
				}
				project.showlist(0);
			}
		});
	},
	delReal:function(id){
		$.ajax({
			url:cgipath + 'project-delReal',type:'POST',data:"id="+id,dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					 message.show("message_div","提示","删除成功！",3)
				}
				else{
					
				}
				project.showlist(0);
			}
		});
	},
	resume:function(id){
		$.ajax({
			url:cgipath + 'project-resume',type:'POST',data:"id="+id,dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					 message.show("message_div","提示","恢复成功！",3)
				}
				else{
					message.show("message_div","提示","恢复失败！",4)
				}
				project.showlist(0);
			}
		});
	},
	perfect:function(id,flag){
		$.ajax({
			url:cgipath + 'project-perfect',type:'POST',data:"id="+id,dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					if(flag==0)
						message.show("message_div","提示","加精成功！",3)
					else
						message.show("message_div","提示","取消加精成功！",3)
					project.showlist(flag);
				}
				else{
					
				}
			}
		});
	},
	export:function(){
		var data_area=[];
		data_area.push([ "project_name" , project_info.name ]);
		var data_str=requestToString(data_area);
		$.ajax({
			url:cgipath + 'project-export',type:'POST',data:data_str,dataType:'json',timeout: ajax_timeout,error:function () {},
			success:function(feedback){
				if(feedback.ret=="0"){
					
				}
				else{
					
				}
			}
		});
	
	}
}

function getLocalTime(nS) {
	if(nS!=""){
		var s=new Date(parseInt(nS)*1000 );
		return s.getFullYear()+"-"+add_zero(s.getMonth()+1)+"-"+add_zero(s.getDate())+" "+add_zero(s.getHours())+":"+add_zero(s.getMinutes());
	}
	else
		return "";
}  
	
function add_zero(str) {
	str=str*1;
	if(str<10)return "0"+str;
	else return str;
}  


function requestToString(data_area) {
	var ret = "";
	for (var i = 0; i < data_area.length; i++) {
		ret += "&" + data_area[i][0];
		ret += "=" + encodeURIComponent(data_area[i][1]);
	}
	ret += "&rand=" + Math.round((Math.random() * 1000000));
	return ret;
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
