<?php
/*********************************************************************************
 * animation 项目类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2012-4-4
***********************************************************************************/
$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);


include_once('include/function.php'); 

class projectMod
{
	public function add()
	{
		global $ret;
		$project_name=$_POST['project_name'];
		$project_author=$_POST['project_author'];
		$project_privacy=0;//$_POST['project_privacy'];
		$canvas_width=$_POST['canvas_width'];
		$canvas_height=$_POST['canvas_height'];

		if(empty($project_name) || empty($canvas_width) || empty($canvas_height)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			$project_new=array('id'=>$project_list_obj->count,'name'=>$project_name,'author'=>$project_author,'privacy'=>$project_privacy,'time_add'=>time(),'time_save'=>'','del_flag'=>0,'layer_count'=>0);
			array_push($project_list_obj->data,$project_new);
			
			
			@mkdir("project/".$project_list_obj->count);
			
			$project_data="{\"project_info\":".json_encode($project_new).",\"canvas_data\":{\"width\":".$canvas_width.",\"height\":".$canvas_height.",\"background_type\":1,\"background_color\":\"#fff\",\"background_image\":\"\"}}";
				
			file_put_contents("project/".$project_list_obj->count."/project.json",$project_data);
			$ret['id']=$project_list_obj->count;
			$project_list_obj->count++;
			file_put_contents("project/project_list.json",json_encode($project_list_obj));

			$ret['ret']='0';
			$ret['msg']="success";

			
		}
		echo(json_encode($ret));
		
	}
	public function del()
	{
		global $ret;
		$id=$_POST['id'];

		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			foreach($project_list_obj->data as $project_item){
				if($project_item->id==$id){
					$project_item->del_flag=1;
				}
			}
			file_put_contents("project/project_list.json",json_encode($project_list_obj));
			
			$ret['ret']='0';
			$ret['msg']="success";

			
		}
		echo(json_encode($ret));
		
	}
	public function delReal()
	{
		global $ret;
		$id=$_POST['id'];

		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			foreach($project_list_obj->data as $project_item){
				if($project_item->id==$id){
					$project_item->del_flag=2;
				}
			}
			file_put_contents("project/project_list.json",json_encode($project_list_obj));
			
			$ret['ret']='0';
			$ret['msg']="success";

			
		}
		echo(json_encode($ret));
		
	}
	public function resume()
	{
		global $ret;
		$id=$_POST['id'];

		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			foreach($project_list_obj->data as $project_item){
				if($project_item->id==$id){
					$project_item->del_flag=0;
				}
			}
			file_put_contents("project/project_list.json",json_encode($project_list_obj));
			
			$ret['ret']='0';
			$ret['msg']="success";

			
		}
		echo(json_encode($ret));
		
	}
	public function perfect()
	{
		global $ret;
		$id=$_POST['id'];

		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			foreach($project_list_obj->data as $project_item){
				if($project_item->id==$id){
					if(isset($project_item->perfect_flag) && $project_item->perfect_flag==1)
						$project_item->perfect_flag=0;
					else
						$project_item->perfect_flag=1;
				}
			}
			file_put_contents("project/project_list.json",json_encode($project_list_obj));
			
			$ret['ret']='0';
			$ret['msg']="success";

			
		}
		echo(json_encode($ret));
		
	}
	public function read()
	{
		global $ret;
		$id=$_POST['id'];

		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			foreach($project_list_obj->data as $project_item){
				if($project_item->id==$id){
					$project_src="project/".$id."/";
					$project_json=file_get_contents($project_src."project.json");
					$ret['info']=$project_item;
					$ret['data']=json_decode($project_json);
					$ret['ret']='0';
					$ret['msg']="success";
				}
			}
			if($ret['ret']!='0'){
				$ret['ret']='2';
				$ret['msg']="read fail";
			}
			
		}
		echo(json_encode($ret));
	}
	
	public function readInfo()
	{
		global $ret;
		$id=$_POST['id'];

		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_list_array=@file_get_contents("project/project_list.json");
			if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
			$project_list_obj=json_decode($project_list_array);
			foreach($project_list_obj->data as $project_item){
				if($project_item->id==$id){
					$project_src="project/".$id."/";
					$src=$project_src."index.htm";
					
					$html=file_get_contents($project_src."html.txt");
					$css=file_get_contents($project_src."css.txt");
					$ret['html']=($html);
					$ret['css']=($css);
					$ret['src']=($src);
					$ret['ret']='0';
					$ret['msg']="success";
				}
			}
			if($ret['ret']!='0'){
				$ret['ret']='2';
				$ret['msg']="read fail";
			}
			
		}
		echo(json_encode($ret));
	}
	
	public function save()
	{
		global $ret;
		$id=$_POST['id'];
		$project_data=json_decode($_POST['project_data']);
		
		if(is_null($id) || empty($project_data)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_src="project/".$id."/";
			$project_data_json=array();
			$project_json_src=$project_src."project.json";
			if(file_exists($project_src)){
				
				$project_list_array=@file_get_contents("project/project_list.json");
				if($project_list_array=="")$project_list_array="{\"count\":0,\"data\":[]}";
				$project_list_obj=json_decode($project_list_array);
				foreach($project_list_obj->data as $project_info){
				
					if($project_info->id==$id){
						$project_info->saveflag=1;
						$project_info->time_save=$project_data->project_info->time_save;
					}
				}
				file_put_contents("project/project_list.json",json_encode($project_list_obj));
				
				@mkdir("project/".$project_list_obj->count);
				
				file_put_contents("project/".$project_list_obj->count."/project.json",$project_data);

				file_put_contents($project_json_src,json_encode($project_data));
				$page=$this->export();
				if($page!="")$ret['page']=$page;
				$ret['ret']='0';
				$ret['msg']="success";

			}
			else{
				$ret['ret']='2';
				$ret['msg']="failed";
			}
		}
		echo(json_encode($ret));
	}
	
	public function export()
	{
		global $ret;
		$id=$_POST['id'];
		$page="";
		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$project_src="project/".$id."/";
			$project_json_src=$project_src."project.json";
			if(file_exists($project_src)){
				$project_json=json_decode(file_get_contents($project_json_src));
				
				//根据project数据生成页面
				$project_export_src="project/".$id."/";
				if(!file_exists($project_export_src))@mkdir($project_export_src);
				$page_src=$project_export_src."index.htm";
				$page_html_src=$project_export_src."html.txt";
				$page_css_src=$project_export_src."css.txt";
				
				//读取模板
				$page_templet="project/templet.htm";
				$page_html=file_get_contents($page_templet);
				
				//生成页面数据
				$page_content="";
				$page_content.="<div class=\"mod_canvas\">".chr(13).chr(10);
				foreach($project_json->layer_data as $layer_data){
					$page_content.=chr(9)."<div class=\"".$layer_data->id."\"></div>".chr(13).chr(10);
				}
				$page_content.="</div>".chr(13).chr(10);
				
				//生成样式数据
				$page_style="";
				
				$background_image_style="";
				$background_image=$project_json->canvas_data->background_image;
				if($background_image!="")$background_image_style="background-image:url(server/".$project_src."/".$background_image.")";
				
				$page_style.=".mod_canvas{background-position:center top;width:".$project_json->canvas_data->width."px;height:".$project_json->canvas_data->height."px;background-color:".$project_json->canvas_data->background_color.";".$background_image_style."}".chr(13).chr(10);

				//$prefix_arr=array("webkit","moz","o","ms");
				$prefix_arr=array("webkit","moz");
				foreach($project_json->layer_data as $layer_data){
					//取出时间最大最小值，得到总时间
					$frame_time_min=10000;
					$frame_time_max=0;
					foreach($layer_data->frame->data as $frame_data){
						$time_temp=(float)($frame_data->time);
						if($frame_time_min>$time_temp)$frame_time_min=$time_temp;
						if($frame_time_max<$time_temp)$frame_time_max=$time_temp;
					}
					$frame_time_total=$frame_time_max-$frame_time_min;
					if($frame_time_max==$frame_time_min)$frame_time_total=1;
					
					$frame_key="frame_".$layer_data->id;
					$animation_style=json_decode($layer_data->style);
					
					$animation_str="-prefix-animation: ".$frame_key." ".$frame_time_total."s";
					if(isset($animation_style->animation_iteration))$animation_str.=" ".$animation_style->animation_iteration;
					else	$animation_str.=" infinite";
					if(isset($animation_style->animation_timing_function))$animation_str.=" ".$animation_style->animation_timing_function;
					if(isset($animation_style->animation_direction))$animation_str.=" ".$animation_style->animation_direction;
					
					$pos_str="";
		
					if(isset($layer_data->left))$pos_str.="left:".$layer_data->left."px;";
					if(isset($layer_data->top))$pos_str.="top:".$layer_data->top."px;";
					
					if($frame_time_min>0)$animation_str.=" ".$frame_time_min."s";
					$animation_str.=";-prefix-animation-fill-mode:both;";
					$animation_str_all="";
					foreach($prefix_arr as $prefix){
						$animation_str_temp=$animation_str;
						$animation_str_all.=chr(9).str_ireplace("-prefix-","-".$prefix."-",$animation_str_temp).chr(13).chr(10);
						
					}
					
					$page_style.=".mod_canvas .".$layer_data->id."{".chr(13).chr(10);
					$page_style.=chr(9)."position:absolute;".$pos_str;
					
					$page_style.=$this->get_style($layer_data->style,$id).chr(13).chr(10);
					
					
					//对top、left值进行校正
					$layer_style=json_decode($layer_data->style);
					$layer_left=$layer_style->left;
					$layer_top=$layer_style->top;
					$frame_data_0=$layer_data->frame->data[0];
					$frame_data_0_style_obj=json_decode($frame_data_0->style);
					$translate_x=isset($frame_data_0_style_obj->translate_x)?$frame_data_0_style_obj->translate_x:0;
					$translate_y=isset($frame_data_0_style_obj->translate_y)?$frame_data_0_style_obj->translate_y:0;
					$page_style.="left:".($layer_left+$translate_x)."px;";
					$page_style.="top:".($layer_top+$translate_y)."px;";
					
					
					
					$page_style.=$animation_str_all.chr(13).chr(10);
					if(isset($layer_data->custom))$page_style.=$layer_data->custom;
					$page_style.="}".chr(13).chr(10);
					
					$keyframes="@-prefix-keyframes ".$frame_key." {".chr(13).chr(10);
					
					foreach($layer_data->frame->data as $frame_data){
						$time_temp=(float)($frame_data->time);
						$time_percent=100*($time_temp-$frame_time_min)/$frame_time_total;
						
						$keyframes.=chr(9).$time_percent."% {".$this->get_style($frame_data->style,$id).$frame_data->custom_style."}".chr(13).chr(10);
					}
					if($frame_time_max==$frame_time_min){//如果只有1帧，也要补齐动画，因为可能帧有延时
						$keyframes.=chr(9)."100% {".$this->get_style($layer_data->frame->data[0]->style,$id)."}".chr(13).chr(10);;
					}
					$keyframes.="}".chr(13).chr(10);
					
					$keyframes_all="";
					foreach($prefix_arr as $prefix){
						$keyframes_temp=$keyframes;
						if($prefix=="moz"){
							$keyframes_temp=preg_replace('/perspective\(.*?\)/', '', $keyframes_temp);
							$keyframes_temp=preg_replace('/rotateX\(.*?\)/', '', $keyframes_temp);
							$keyframes_temp=preg_replace('/rotateY\(.*?\)/', '', $keyframes_temp);
							$keyframes_temp=preg_replace('/translateZ\(.*?\)/', '', $keyframes_temp);
						}
						$keyframes_all.=str_ireplace("-prefix-","-".$prefix."-",$keyframes_temp);
					}
					$page_style.=$keyframes_all;
					
				}
				
				$page_style=str_ireplace("server/project/","../../project/",$page_style);
				$page_html=str_ireplace("{\$title}",$project_json->project_info->name,$page_html);
				$page_html=str_ireplace("{\$style}",$page_style,$page_html);
				$page_html=str_ireplace("{\$content}",$page_content,$page_html);

				file_put_contents($page_html_src,$page_content);
				file_put_contents($page_css_src,$page_style);
				file_put_contents($page_src,$page_html);
				$page=$page_src;

			}
		}
		return $page;
	}
	
	public function get_style($style,$id)
	{
		/*读取样式*/
		$ret="";
		$style_obj=json_decode($style);
		$special_key=array('translate_x','translate_y','skew','scale_x','scale_y','rotate','background_size_x','background_size_y','background_image','border_width','border_color','border_type','border_radius','animation_timing_function','animation_iteration','animation_direction','orgin_x','orgin_y','perspective','translate_z','rotate_x','rotate_y');
		foreach($style_obj as $key=>$value){
			if(!in_array($key,$special_key)){
				$ret.=$key.":".$value.";";
			}
		}
		
		if(isset($style_obj->rotate) || isset($style_obj->rotate_x) || isset($style_obj->rotate_y) || isset($style_obj->translate_x) || isset($style_obj->translate_y) || isset($style_obj->scale_x) || isset($style_obj->scale_y) || isset($style_obj->skew) || isset($style_obj->perspective)){
			
			$rotate=isset($style_obj->rotate)?$style_obj->rotate:0;
			$rotate_x=isset($style_obj->rotate_x)?$style_obj->rotate_x:0;
			$rotate_y=isset($style_obj->rotate_y)?$style_obj->rotate_y:0;
			$translate_x=isset($style_obj->translate_x)?$style_obj->translate_x:0;
			$translate_y=isset($style_obj->translate_y)?$style_obj->translate_y:0;
			$translate_z=isset($style_obj->translate_z)?$style_obj->translate_z:0;
			$scale_x=isset($style_obj->scale_x)?$style_obj->scale_x:1;
			$scale_y=isset($style_obj->scale_y) ?$style_obj->scale_y:1;
			$skew=isset($style_obj->skew)?$style_obj->skew:0;
			$perspective=isset($style_obj->perspective)?$style_obj->perspective:0;
			
			
			
			$transform_css="-prefix-transform:";
			$transform_css.="perspective(".$perspective."px) ";	
			$transform_css.="translate(".$translate_x."px,".$translate_y."px) ";
			$transform_css.="translateZ(".$translate_z."px) ";
			$transform_css.="scale(".$scale_x.",".$scale_y.") ";	
			$transform_css.="skew(".$skew."deg) ";	
			$transform_css.="rotateX(".$rotate_x."deg) ";	
			$transform_css.="rotateY(".$rotate_y."deg) ";	
			$transform_css.="rotate(".$rotate."deg) ";	
			
		
			$transform_css.=";";
			$ret.=$transform_css;
		}
		
		if(isset($style_obj->orgin_x)){
			$background_css="-prefix-transform-origin:".$style_obj->orgin_x."% ".$style_obj->orgin_y."%;";
			$ret.=$background_css;
		}
		
		if(isset($style_obj->background_size_x)){
			$background_css="background-size:".$style_obj->background_size_x."% ".$style_obj->background_size_y."%;";
			$ret.=$background_css;
		}
		
		if(isset($style_obj->background_image)){
			$background_css="background-image:url(server/project/".$id."/".$style_obj->background_image.");";
			$ret.=$background_css;
		}
		
		if(isset($style_obj->border_width)){
			$border_css="border:".$style_obj->border_color." ".$style_obj->border_type." ".$style_obj->border_width."px;";
			$ret.=$border_css;
		}
		
		if(isset($style_obj->border_radius)){
			$border_css="border-radius:".$style_obj->border_radius."px;";
			$ret.=$border_css;
		}
		return $ret;
	}
	
	
	
	public function showlist()
	{
		global $ret;
		$project_file="project/project_list.json";
		$project_list=json_decode(file_get_contents($project_file));
		$ret['project_list']=$project_list;
		$ret['ret']=0;
		$ret['msg']='success';
		echo(json_encode($ret));
	}

}




?>