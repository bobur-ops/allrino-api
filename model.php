<?php 

include "kernel/main/conf.php";
$id=$_GET['model'];
//echo iconv("windows-1251","UTF-8",$id);
$id=iconv('UTF-8','windows-1251',$id);
if(!$id) $id=$_GET['model'];

if($id && $id != 'empty'){
	$mod = mysql::select("select id,name from #catalog_section2 where parent='$id'");
	foreach ($mod as $row) {
		echo "<option value='$row[id]'>$row[name]</option>";
	}
}else{
	echo "<option value=''>-&nbsp;</option>";
}