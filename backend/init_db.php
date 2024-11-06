<?php


$host = 'localhost';  
$user = 'root';  
$password = 'root';  
$dbname = 'tptest';  //u can enter ur name prefer but dont forget to change also in pdo.php
$sqlFilePath = 'creatdb.sql';  

try {

    $pdo = new PDO("mysql:host=$host", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    $pdo->exec("CREATE DATABASE `$dbname`");
    echo "database `$dbname` create sucessfully。<br>";

    $pdo->exec("USE `$dbname`");


    $sql = file_get_contents($sqlFilePath);
    
 
    $pdo->exec($sql);
    echo "SQL document has been excuted sucessfully。<br>";
    
} catch (PDOException $e) {
    echo "create unsucessfully " . $e->getMessage();
}
?>