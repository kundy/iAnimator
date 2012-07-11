<?php
/*********************************************************************************
 * QAM 1.0 框架入口文件
 *-------------------------------------------------------------------------------
 * $Author:Kundy
 * $Dtime:2011-9-4
***********************************************************************************/

require('include/conn.php');


$request_url=$_SERVER["REQUEST_URI"];

$parm=preg_replace("/.*\?(.*?)/","$1",$request_url); 

$parm_arr=explode("-",$parm);
$module=$parm_arr[0];
$method=$parm_arr[1];


$post=$_POST;
foreach($post as $key=>$val) {
	$post[$key]=addslashes($val);
}


require_once($module.'.php');
$module_str="\$simulation=new ".$module."Mod;";
$method_str="\$simulation->".$method."(\$post);";
eval($module_str.$method_str);



?>