<?php

$host = 'localhost';  
$user = 'root';  
$password = 'root';  
$dbname = '1234';  
$sqlFilePath = 'createdb.sql';  

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