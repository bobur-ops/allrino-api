<?php
$filename = 'base/all.json';
if (file_exists($filename)) {
if ($_GET['id']=='DKeyArray') {
 $datef = date ("F d Y H:i:s.", filemtime($filename));
echo $datef; }
if ($_GET['id']=='KeyArray') {
$file_handle = fopen($filename, "r");
while (!feof($file_handle)) {
 $line = fgets($file_handle);
echo $line;}
 fclose($file_handle);
}	
}
$filename = 'baners/baners.txt';
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
$filename = 'baners/firmlist.json';
if (file_exists($filename)) {
if ($_GET['id']=='spicokFirms') {
$file_handle = fopen($filename, "r");
while (!feof($file_handle)) {
 $line = fgets($file_handle);
echo $line;}
 fclose($file_handle);
}	
}
$filename = 'ver.txt';
if (file_exists($filename)) {
if ($_GET['id']=='ver') {
$file_handle = fopen($filename, "r");
while (!feof($file_handle)) {
 $line = fgets($file_handle);
echo $line;}
 fclose($file_handle);
}	
}
$filename = 'baners/filelist.txt';
if (file_exists($filename)) {
if ($_GET['id']=='spicok') {
$file_handle = fopen($filename, "r");
while (!feof($file_handle)) {
 $line = fgets($file_handle);
echo $line;}
 fclose($file_handle);
}	
}
if ($_GET['id']=='baners') {
	$filename = $_GET['file'];
if (file_exists($filename)) {
$file_handle = fopen($filename, "r");
while (!feof($file_handle)) {
 $line = fgets($file_handle);
echo $line;}
 fclose($file_handle);
}	
}
?>