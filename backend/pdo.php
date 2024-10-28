<?php
    define('_MYSQL_HOST','127.0.0.1');
    define('_MYSQL_PORT',3306);
    define('_MYSQL_DBNAME','tptest');
    define('_MYSQL_USER','root');
    define('_MYSQL_PASSWORD','root');
    // echo "mysql:host=" . _MYSQL_HOST . ";port=" . _MYSQL_PORT . ";dbname=" . _MYSQL_DBNAME, _MYSQL_USER, _MYSQL_PASSWORD.";charset=utf8";die;
    $pdo=new PDO("mysql:host=" . _MYSQL_HOST . ";port=" . _MYSQL_PORT . ";dbname=" . _MYSQL_DBNAME.";charset=utf8", _MYSQL_USER, _MYSQL_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO:: ERRMODE_EXCEPTION);

?>
