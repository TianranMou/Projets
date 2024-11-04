<?php
try {
    // 连接数据库
    $pdo = new PDO('mysql:host=localhost;dbname=tptest', 'root', 'root');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "数据库连接成功<br>";

    // 准备插入语句
    $sql = "INSERT INTO user (ID_USER, ID_SEXE, SPORT_VALUE, SURNAME, NAME, DATE_OF_BRITH, PWD, EMAIL) 
            VALUES (3, 1, 3, 'Test3', 'USER3', '2003-01-27', 'test3', 'user3@example.com')";
    
    // 执行插入
    $pdo->exec($sql);
    echo "新用户插入成功！";

} catch(PDOException $e) {
    die("错误: " . $e->getMessage());
}
?>