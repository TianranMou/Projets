<?php
$dbname = 'output'

try {
    
    
    $pdo = new PDO('mysql:host=localhost', 'root', 'root');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "数据库连接成功<br>";
    
    $pdo ->exec("CREATE DATABASE `$dbname`");
    $pdo ->exec("USE `$dbname`");

    
    $sqlFile = './createdb.sql';
    if (!file_exists($sqlFile)) {
        die("错误：SQL文件不存在，路径: " . $sqlFile . "<br>");
    }
    
    $sql = file_get_contents($sqlFile);
    if ($sql === false) {
        die("错误：无法读取SQL文件<br>");
    }
    echo "SQL文件读取成功<br>";
    
    $pdo->exec($sql);
    echo "数据库初始化成功！<br>";
    
} catch(PDOException $e) {
    die("数据库错误: " . $e->getMessage() . "<br>");
} catch(Exception $e) {
    die("一般错误: " . $e->getMessage() . "<br>");
}
?>