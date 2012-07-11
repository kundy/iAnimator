<?php
/*********************************************************************************
 * animation 图像类
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2012-4-4
***********************************************************************************/
$ret = array(
	  'ret'=>'-1',
	  'msg'=>"异常"
);


include_once('include/function.php'); 

class imageMod
{
	function thumb($id,$img_name){
		$img_src="project/".$id."/";
		$img_orgin=$img_src.$img_name;
		$img_src_thumb=$img_src."_thumb_".$img_name;
		$img_info=getimagesize($img_orgin);
		$img_width=$img_info[0];
		$img_height=$img_info[1];
		switch ($img_info[2])
		{
			case '2' :
				$source = imagecreatefromjpeg($img_orgin);
				break;
			case '3' :
				$source = imagecreatefrompng($img_orgin);
				break;
			case '1' :
				$source = imagecreatefromgif($img_orgin);
				break;
			default :
				return false;
		}
		$new_height=ceil($img_height*100/$img_width);
		$thumb = imagecreatetruecolor(100,$new_height);
		imagecopyresized($thumb,$source,0,0,0,0,100,$new_height,$img_width,$img_height);
		imagepng($thumb,$img_src_thumb);
		return ("_thumb_".$img_name);
	}
	
	public function showlist()
	{
		global $ret;
		$id=$_POST['id'];
		
		if(is_null($id)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$img_src="project/".$id."/";
			$img_json_src=$img_src."list.json";
			if(file_exists($img_src)){
				$img_json_content=@file_get_contents($img_json_src);
				if(strlen($img_json_content)==0)$img_json_content="[]";
				$img_json=json_decode($img_json_content);
				$ret['ret']='0';
				$ret['msg']="success";
				$ret['img_list']=$img_json;

			}
			else{
				$ret['ret']='2';
				$ret['msg']="failed";
			}
		}
		echo(json_encode($ret));
	}
	
	public function upload()
	{
		global $ret;
		$id=$_POST['id'];
		$img_data=json_decode($_POST['img_data']);
		
		if(is_null($id) || empty($img_data)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$img_src="project/".$id."/";
			$img_json=array();
			$img_json_src=$img_src."list.json";
			if(file_exists($img_src)){

				$img_json_content=@file_get_contents($img_json_src);
				if(strlen($img_json_content)==0)$img_json_content="[]";
				$img_json=json_decode($img_json_content);
				

				foreach($img_data as $img_item){
					$image_last=iconv("UTF-8","GBK",$img_src.$img_item->name);
					$image_arr=explode(",",$img_item->data);
					$file_put_ret=file_put_contents($image_last,base64_decode($image_arr[1]));
					$img_info=getimagesize($image_last);
					$img_width=$img_info[0];
					$img_height=$img_info[1];
					$img_thumb_width=$img_info[0];
					$img_thumb_height=$img_info[1];
					$thumb_name=$img_item->name;
					if($img_width>100){
						$thumb_name=$this->thumb($id,$img_item->name);
						$img_info=getimagesize($img_src.$thumb_name);
						$img_thumb_width=$img_info[0];
						$img_thumb_height=$img_info[1];
					}
					
					
					if(!empty($file_put_ret)){//保存文件成功
						//判断文件是否已存在
						$img_exist_flag=false;
						

						foreach($img_json as $img_json_item){
							//var_dump($img_json_item);
							if($img_json_item->name==$img_item->name){
								$img_exist_flag=true;
							}
						}
						if(!$img_exist_flag){
							array_push($img_json,json_decode(json_encode(array('name'=>$img_item->name,'thumb_name'=>$thumb_name,'thumb_width'=>$img_thumb_width,'thumb_height'=>$img_thumb_height,'width'=>$img_width,'height'=>$img_height))));
						}
					}
				}
				file_put_contents($img_json_src,json_encode($img_json));
				
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

	public function del()
	{
		global $ret;
		$id=$_POST['id'];
		$img_name=$_POST['name'];
		if(is_null($id) || empty($img_name)){
			$ret['ret']='1';
			$ret['msg']="parm error";
		}
		else{
			$img_src="project/".$id."/";
			$img_json=array();
			$img_json_src=$img_src."list.json";
			if(file_exists($img_src)){
				$img_json_content=@file_get_contents($img_json_src);
				if(strlen($img_json_content)==0)$img_json_content="[]";
				$img_json=json_decode($img_json_content);
				
				
				$thumb_name=$img_name;
				$img_json_new=array();
				foreach($img_json as $img_item){
					if($img_name!=$img_item->name){
						array_push($img_json_new,$img_item);
					}
					else{
						$thumb_name=$img_item->thumb_name;
					}
				}
				@unlink($img_src.$thumb_name);
				@unlink($img_src.$img_name);
				file_put_contents($img_json_src,json_encode($img_json_new));
				
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
	
	

}


?>