<?php


/*获取终端浏览器版本*/
function get_browser_version(){
	$version=$_SERVER['HTTP_USER_AGENT'];
	
	if(stripos($version,"IE")>-1)$ret="IE";
	else if(stripos($version,"Chrome")>-1)$ret="Chrome";
	else if(stripos($version,"Firefox")>-1)$ret="Firefox";
	else if(stripos($version,"Safari")>-1)$ret="Safari";
	else if(stripos($version,"Opera")>-1)$ret="Opera";
	else $ret="IE";
	return $ret;
}



//打印输出
function log_print($content,$file){
	if(is_null($file)){
		$debug_backtrace=debug_backtrace();
		$file_name=preg_replace('/.*\\\\(.*?)/', '$1', $debug_backtrace[0]["file"]);
		$log_content="[".date("His")."][".$file_name."][".$debug_backtrace[0]["line"]."]".$content.chr(13).chr(10);
		
		$file_path="log/print_".date('Ymd').".txt";
		$log_content=file_get_contents($file_path).$log_content;
	}
	else if($file=="performance"){
		$file_path="log/performance_".date('Ymd').".txt";
		$log_content=file_get_contents($file_path).$log_content;
		$log_content.="[".date("His")."]".$content.chr(13).chr(10);
	}
	
	file_put_contents($file_path,$log_content);
}



//数组去空
function array_remove_empty(& $arr, $trim = true){
    foreach ($arr as $key => $value) {
        if (is_array($value)) {
            array_remove_empty($arr[$key]);
        } else {
            $value = trim($value);
            if ($value == '') {
                unset($arr[$key]);
            } elseif ($trim) {
                $arr[$key] = $value;
            }
        }
    }
}

//检查文件名称与类型
function check_file($_file)
{
	$file_name=substr($_file,0,strripos($_file,"."));
	$file_type=substr($_file,strripos($_file,".")+1,(strlen($_file)-strripos($_file,".")));
	$ret=array('name'=>$file_name,'type'=>$file_type);
	return $ret;
}


//创建多级目录
function createFolder($path) //自定义的创建文件夹的函数        
{
   if (!file_exists($path))         //如果文件夹不存在 
    {
     createFolder(dirname($path));    //递归创建  //取得最后一个文件夹的全路径返回开始的地方
     mkdir($path, 0777);//创建并写文件
    }
}

//删除文件夹，包括里面的文件
function deldir($dir) {
  $dh=opendir($dir);
  while ($file=readdir($dh)) {
    if($file!="." && $file!="..") {
      $fullpath=$dir."/".$file;
      if(!is_dir($fullpath)) {
          unlink($fullpath);
      } else {
          deldir($fullpath);
      }
    }
  }

  closedir($dh);
  
  if(rmdir($dir)) {
    return true;
  } else {
    return false;
  }
}



 
 
//获取文件列表
function file_list($path,$sub_flag,$file_type){

	global $file_nums_all;
	global $file_nums_use;
	global $file_use_arr;
	system("net use  ".$path." /user:kundyZhang cv0837CVJ ");

	$file_type_arr=explode(",",$file_type);
		
	if ($handle = opendir($path)) {
		while (false !== ($file = readdir($handle))) {
			if ($file != "." && $file != "..") {
				if (is_dir($path."\\".$file))
				{
					//echo StripSlashes($path)."\\".$file."<br>";//目录名称
					if($sub_flag=="1")
					{
						file_list($path."\\\\".$file,"1",$file_type);
					}
				} 
				else 
				{
					//echo StripSlashes($path)."\\".$file."<br>";//文件名称
					$file_nums_all++;
					$check_file_type=check_file($file);
					if(in_array($check_file_type["type"],$file_type_arr))
					{
						$file_nums_use++;
						array_push($file_use_arr,StripSlashes($path)."\\".$file);
					}
				}
			}
		}
	}
	
}


function format($str){ 

	$str = htmlspecialchars($str); 
	if ($str=="") $str="&nbsp;";
	$str = str_replace("\r\n","<br>",$str); 
	$str = str_replace("\r","<br>",$str); 
	$str = str_replace("\n","<br>",$str); 
	$str = str_replace(" ","&nbsp;",$str);
	$str = str_replace("	","&emsp;",$str);
	$str = str_replace("'","&#039;",$str);
	return $str; 
}


/**
* Author : smallchicken
* Time   : 2009年6月8日16:46:05
* mode 1 : 强制裁剪，生成图片严格按照需要，不足放大，超过裁剪，图片始终铺满
* mode 2 : 和1类似，但不足的时候 不放大 会产生补白，可以用png消除。
* mode 3 : 只缩放，不裁剪，保留全部图片信息，会产生补白，
* mode 4 : 只缩放，不裁剪，保留全部图片信息，生成图片大小为最终缩放后的图片有效信息的实际大小，不产生补白
* 默认补白为白色，如果要使补白成透明像素，请使用SaveAlpha()方法代替SaveImage()方法
*
* 调用方法：
*
* $ic=new ImageCrop('old.jpg','afterCrop.jpg');
* $ic->Crop(120,80,2);
* $ic->SaveImage();
*        //$ic->SaveAlpha();将补白变成透明像素保存
* $ic->destory();
* 
*
*/
class ImageCrop{

var $sImage;
var $dImage;
var $src_file;
var $dst_file;
var $src_width;
var $src_height;
var $src_ext;
var $src_type;

function ImageCrop($src_file,$dst_file=''){
$this->src_file=$src_file;
$this->dst_file=$dst_file;
$this->LoadImage();
}

function SetSrcFile($src_file){
$this->src_file=$src_file;
}

function SetDstFile($dst_file){
$this->dst_file=$dst_file;
}

function LoadImage(){
list($this->src_width, $this->src_height, $this->src_type) = getimagesize($this->src_file);
switch($this->src_type) {
case IMAGETYPE_JPEG :
$this->sImage=imagecreatefromjpeg($this->src_file);
$this->ext='jpg';
break;
case IMAGETYPE_PNG :
$this->sImage=imagecreatefrompng($this->src_file);
$this->ext='png';
break;
case IMAGETYPE_GIF :
$this->sImage=imagecreatefromgif($this->src_file);
$this->ext='gif';
break;
default:
exit();
}
}

function SaveImage($fileName=''){
$this->dst_file=$fileName ? $fileName : $this->dst_file;
switch($this->src_type) {
case IMAGETYPE_JPEG :
imagejpeg($this->dImage,$this->dst_file,100);
break;
case IMAGETYPE_PNG :
imagepng($this->dImage,$this->dst_file);
break;
case IMAGETYPE_GIF :
imagegif($this->dImage,$this->dst_file);
break;
default:
break;
}
}

function OutImage(){
switch($this->src_type) {
case IMAGETYPE_JPEG :
header('Content-type: image/jpeg');
imagejpeg($this->dImage);
break;
case IMAGETYPE_PNG :
header('Content-type: image/png');
imagepng($this->dImage);
break;
case IMAGETYPE_GIF :
header('Content-type: image/gif');
imagegif($this->dImage);
break;
default:
break;
}
}

function SaveAlpha($fileName=''){
$this->dst_file=$fileName ? $fileName . '.png' : $this->dst_file .'.png';
imagesavealpha($this->dImage, true);
imagepng($this->dImage,$this->dst_file);
}

function OutAlpha(){
imagesavealpha($this->dImage, true);
header('Content-type: image/png');
imagepng($this->dImage);
}    

function destory(){
imagedestroy($this->sImage);
imagedestroy($this->dImage);
}

function Crop($dst_width,$dst_height,$mode=1,$dst_file=''){
if($dst_file) $this->dst_file=$dst_file;
$this->dImage = imagecreatetruecolor($dst_width,$dst_height);

$bg = imagecolorallocatealpha($this->dImage,255,255,255,127);
imagefill($this->dImage, 0, 0, $bg);
imagecolortransparent($this->dImage,$bg);

$ratio_w=1.0 * $dst_width / $this->src_width;
$ratio_h=1.0 * $dst_height / $this->src_height;
$ratio=1.0;
switch($mode){
case 1:        // always crop
if( ($ratio_w < 1 && $ratio_h < 1) || ($ratio_w > 1 && $ratio_h > 1)){
$ratio = $ratio_w < $ratio_h ? $ratio_h : $ratio_w;
$tmp_w = (int)($dst_width / $ratio);
$tmp_h = (int)($dst_height / $ratio);
$tmp_img=imagecreatetruecolor($tmp_w , $tmp_h);
$src_x = (int) (($this->src_width-$tmp_w)/2) ; 
$src_y = (int) (($this->src_height-$tmp_h)/2) ;    
imagecopy($tmp_img, $this->sImage, 0,0,$src_x,$src_y,$tmp_w,$tmp_h);    
imagecopyresampled($this->dImage,$tmp_img,0,0,0,0,$dst_width,$dst_height,$tmp_w,$tmp_h);
imagedestroy($tmp_img);
}else{
$ratio = $ratio_w < $ratio_h ? $ratio_h : $ratio_w;
$tmp_w = (int)($this->src_width * $ratio);
$tmp_h = (int)($this->src_height * $ratio);
$tmp_img=imagecreatetruecolor($tmp_w ,$tmp_h);
imagecopyresampled($tmp_img,$this->sImage,0,0,0,0,$tmp_w,$tmp_h,$this->src_width,$this->src_height);
$src_x = (int)($tmp_w - $dst_width) / 2 ; 
$src_y = (int)($tmp_h - $dst_height) / 2 ;    
imagecopy($this->dImage, $tmp_img, 0,0,$src_x,$src_y,$dst_width,$dst_height);
imagedestroy($tmp_img);
}
break;
case 2:        // only small
if($ratio_w < 1 && $ratio_h < 1){
$ratio = $ratio_w < $ratio_h ? $ratio_h : $ratio_w;
$tmp_w = (int)($dst_width / $ratio);
$tmp_h = (int)($dst_height / $ratio);
$tmp_img=imagecreatetruecolor($tmp_w , $tmp_h);
$src_x = (int) ($this->src_width-$tmp_w)/2 ; 
$src_y = (int) ($this->src_height-$tmp_h)/2 ;    
imagecopy($tmp_img, $this->sImage, 0,0,$src_x,$src_y,$tmp_w,$tmp_h);    
imagecopyresampled($this->dImage,$tmp_img,0,0,0,0,$dst_width,$dst_height,$tmp_w,$tmp_h);
imagedestroy($tmp_img);
}elseif($ratio_w > 1 && $ratio_h > 1){
$dst_x = (int) abs($dst_width - $this->src_width) / 2 ; 
$dst_y = (int) abs($dst_height -$this->src_height) / 2;    
imagecopy($this->dImage, $this->sImage,$dst_x,$dst_y,0,0,$this->src_width,$this->src_height);
}else{
$src_x=0;$dst_x=0;$src_y=0;$dst_y=0;
if(($dst_width - $this->src_width) < 0){
$src_x = (int) ($this->src_width - $dst_width)/2;
$dst_x =0;
}else{
$src_x =0;
$dst_x = (int) ($dst_width - $this->src_width)/2;
}

if( ($dst_height -$this->src_height) < 0){
$src_y = (int) ($this->src_height - $dst_height)/2;
$dst_y = 0;
}else{
$src_y = 0;
$dst_y = (int) ($dst_height - $this->src_height)/2;
}
imagecopy($this->dImage, $this->sImage,$dst_x,$dst_y,$src_x,$src_y,$this->src_width,$this->src_height);
}
break;
case 3:        // keep all image size and create need size
if($ratio_w > 1 && $ratio_h > 1){
$dst_x = (int)(abs($dst_width - $this->src_width )/2) ; 
$dst_y = (int)(abs($dst_height- $this->src_height)/2) ;
imagecopy($this->dImage, $this->sImage, $dst_x,$dst_y,0,0,$this->src_width,$this->src_height);
}else{
$ratio = $ratio_w > $ratio_h ? $ratio_h : $ratio_w;
$tmp_w = (int)($this->src_width * $ratio);
$tmp_h = (int)($this->src_height * $ratio);
$tmp_img=imagecreatetruecolor($tmp_w ,$tmp_h);
imagecopyresampled($tmp_img,$this->sImage,0,0,0,0,$tmp_w,$tmp_h,$this->src_width,$this->src_height);
$dst_x = (int)(abs($tmp_w -$dst_width )/2) ; 
$dst_y = (int)(abs($tmp_h -$dst_height)/2) ;
imagecopy($this->dImage, $tmp_img, $dst_x,$dst_y,0,0,$tmp_w,$tmp_h);
imagedestroy($tmp_img);
}
break;
case 4:        // keep all image but create actually size
if($ratio_w > 1 && $ratio_h > 1){
$this->dImage = imagecreatetruecolor($this->src_width,$this->src_height);
imagecopy($this->dImage, $this->sImage,0,0,0,0,$this->src_width,$this->src_height);
}else{
$ratio = $ratio_w > $ratio_h ? $ratio_h : $ratio_w;
$tmp_w = (int)($this->src_width * $ratio);
$tmp_h = (int)($this->src_height * $ratio);
$this->dImage = imagecreatetruecolor($tmp_w ,$tmp_h);
imagecopyresampled($this->dImage,$this->sImage,0,0,0,0,$tmp_w,$tmp_h,$this->src_width,$this->src_height);
}
break;
case 5:        // only small and top
if($ratio_w < 1 && $ratio_h < 1){
$ratio = $ratio_w < $ratio_h ? $ratio_h : $ratio_w;
$tmp_w = (int)($dst_width / $ratio);
$tmp_h = (int)($dst_height / $ratio);
$tmp_img=imagecreatetruecolor($tmp_w , $tmp_h);
$src_x = (int) ($this->src_width-$tmp_w)/2 ; 
$src_y = 0;//(int) ($this->src_height-$tmp_h)/2 ;    
imagecopy($tmp_img, $this->sImage, 0,0,$src_x,$src_y,$tmp_w,$tmp_h);    
imagecopyresampled($this->dImage,$tmp_img,0,0,0,0,$dst_width,$dst_height,$tmp_w,$tmp_h);
imagedestroy($tmp_img);
}elseif($ratio_w > 1 && $ratio_h > 1){
$dst_x = (int) abs($dst_width - $this->src_width) / 2 ; 
$dst_y = (int) abs($dst_height -$this->src_height) / 2;    
imagecopy($this->dImage, $this->sImage,$dst_x,$dst_y,0,0,$this->src_width,$this->src_height);
}else{
$src_x=0;$dst_x=0;$src_y=0;$dst_y=0;
if(($dst_width - $this->src_width) < 0){
$src_x = (int) ($this->src_width - $dst_width)/2;
$dst_x =0;
}else{
$src_x =0;
$dst_x = (int) ($dst_width - $this->src_width)/2;
}

if( ($dst_height -$this->src_height) < 0){
$src_y = (int) ($this->src_height - $dst_height)/2;
$dst_y = 0;
}else{
$src_y = 0;
$dst_y = (int) ($dst_height - $this->src_height)/2;
}
imagecopy($this->dImage, $this->sImage,$dst_x,$dst_y,$src_x,$src_y,$this->src_width,$this->src_height);
}
break;
}
}// end Crop


}
?>