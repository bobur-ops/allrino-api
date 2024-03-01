<?php
include "kernel/main/conf.php";
$sqlResult = "
INSERT INTO `avtospravka`.`a1a` (
`id` ,
`date` ,
`msg` ,
`msg_trans` ,
`operator_id` ,
`user_id` ,
`smsid` ,
`cost_rur` ,
`cost` ,
`test` ,
`num` ,
`skey` ,
`sign` ,
`ran` ,
`answer` 
)
VALUES (
NULL , '".$_GET['date']."', '".$_GET['msg']."', '".$_GET['msg_trans']."', '".$_GET['operator_id']."', '".$_GET['user_id']."', '".$_GET['smsid']."', '".$_GET['cost_rur']."', '".$_GET['cost']."', '".$_GET['test']."', '".$_GET['num']."', '".$_GET['skey']."', '".$_GET['sign']."', '".$_GET['ran']."', '".$_GET['answer']."'
);
";
if (mysql_query($sqlResult)){
    
}else{
    
}


		
		
// префикс сообщени€
$prefix = '+7788';

// номер объ€влени€, который необходимо подогреть
$hot_ob = (int)trim(str_replace($prefix,'',$_GET['msg']));

// получаем текущее объ€вление
$selectCar = mysql_fetch_assoc(mysql_query("
SELECT id, hotposted, hotweek, DATE_FORMAT(`hotposted`,'%H:%i:%s:%m:%d:%Y') AS perevod 
FROM ".conf::$dbprefix."avtocatalog 
WHERE id = '$hot_ob'
"));

// если недел€ проставлена
if ( $selectCar['hotposted'] ) {
    // берем текущую дату в секундах
    $time = 0;
    $pieces = explode(":", $selectCar["perevod"]);
    $newSec = mktime($pieces[0], $pieces[1], $pieces[2], $pieces[3], $pieces[4], $pieces[5]);
} else {
    // берем текущую дату в секундах
    $time = time();

    $newSec = 0;
}


// одна недел€
$onWeek = 1;



// вычисл€ем сколько нужно прибавить секунд к текущему времени
$week = $onWeek;
$plus = 604800 * $week; // 7 * 24 * 60 * 60 = 604800

// прибавл€ем к текущему времени необходимое количество
$time = $newSec + $time + $plus;

// преобразуем в необходимый формат
$dateFormat = date("Y-m-d H:i:s",$time);

$queryupdate = "UPDATE ".conf::$dbprefix."avtocatalog SET hotweek='".$onWeek."', hotposted='".$dateFormat."' WHERE id = '".$hot_ob."'";
// ¬ыполн€ем запрос
if(mysql_query($queryupdate)) {

} else {

}
		

$dateFormat."|".hrdate($dateFormat);

$smsid = $_GET['smsid'];
$skey = $_GET['skey'];
$secretkey = "MVpMXp7QBB5M";
if (md5($secretkey) != $skey) header("HTTP/1.0 404 Not Found");
echo "smsid:$smsid\n";	
echo "status:reply\n";
echo "\n";
echo "—ообщение обработано, http://avtospravka.tomsk.ru\n";
?>