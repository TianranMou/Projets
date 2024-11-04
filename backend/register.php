<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tptest', 'root', 'root');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 先检查邮箱是否已存在
    $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM user WHERE EMAIL = ?");
    $checkEmail->execute([$_POST['email']]);
    
    if ($checkEmail->fetchColumn() > 0) {
        // 邮箱已存在，返回错误
        header('Location: ../account.html?error=email_exists');
        exit();
    }

    // 邮箱不存在，继续注册流程
    $stmt = $pdo->prepare("INSERT INTO user (SURNAME, NAME, EMAIL, PWD, ID_SEXE, SPORT_VALUE, DATE_OF_BRITH) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $_POST['surname'],
        $_POST['name'],
        $_POST['email'],
        $_POST['password'],
        $_POST['id_sexe'],
        $_POST['sport_value'],
        $_POST['date_of_birth']
    ]);

    header('Location: ../account.html?registered=1');
    exit();

} catch(PDOException $e) {
    header('Location: ../account.html?error=system');
    exit();
}
?>