<?php 
require_once('class.phpmailer.php');
$html = $_GET[html];
$names = $_GET['mails'];
$pieces = explode(", ", $names);
$mail = new PHPMailer;
$mail->CharSet = 'UTF-8';

// Настройки SMTP
 $mail->IsSMTP();
$mail->SMTPAuth = true;
$mail->SMTPDebug = 0;
$mail->Host = "smtp.beget.com";
 $mail->SMTPSecure = "ssl";
$mail->Port = 465;
 $mail->Priority    = 5;
  $mail->Encoding    = '8bit';
$mail->Username = "avtospravka@avtospravka.tomsk.ru";
$mail->Password = "red668483";
// От кого
$mail->setFrom('avtospravka@avtospravka.tomsk.ru', 'Пересылка запроса');        

// Тема письма
$mail->Subject = "Ищу запчасть, услуги сервиса...";

// Тело письма
$body = $html;
$mail->msgHTML($body);
// Кому
foreach ( $pieces as $name ) {
$mail->addBCC($name);
}
if(!$mail->Send()){
	if ($mail->ErrorInfo === 'timeout') {
		echo "Отправлено"  . $mail->ErrorInfo;
	}
	else {
  echo "Ошибка отправки письма: " . $mail->ErrorInfo;
	}
}else{
 echo "Отправлено";
 
}



?>