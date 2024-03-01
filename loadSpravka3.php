<?php

       $a = file_get_contents("php://input");
	//  $filename = 'allemp.json';
	 // $handler = fopen($filename, "w");
	 // fwrite($handler, $a);
	   // you should check $a consists valid json - what you want it to be
     file_put_contents('city.json', $a);
	echo $a;

?>