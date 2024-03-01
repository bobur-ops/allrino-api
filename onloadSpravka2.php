<?php
$filename = 'base/firms.json';
if (file_exists($filename)) {
if ($_GET['id']=='DKeyArray') {
 $datef = date ("F d Y H:i:s.", filemtime($filename));
echo $datef; }
if ($_GET['id']=='KeyArray') {
	header("Content-type: application/zip");
	$f=fopen($filename, "rb"); // имя файла или картинки -- открыли файл на чтение
   $upload=fread($f,filesize($filename)); // считали файл в переменную
   fclose($f); // закрыли файл, можно опустить
	echo $upload;
}
	
// while (!feof($file_handle)) {
 // $line = fgets($file_handle);
  // echo $line;}
 // fclose($file_handle);
// }	
}
$filename = 'base/banners.json';
if (file_exists($filename)) {
if ($_GET['id']=='DKeyBaner') {
 $datef = date ("F d Y H:i:s.", filemtime($filename));
echo $datef; }
if ($_GET['id']=='KeyBaner') {
$file_handle = fopen($filename, "r");
while (!feof($file_handle)) {
 $line = fgets($file_handle);
echo $line;}
 fclose($file_handle);
}	
}

?>