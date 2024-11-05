<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tptest', 'root', 'root');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 验证 sport_value 是否在有效范围内
    $sport_value = intval($_POST['sport_value']);
    if ($sport_value < 0 || $sport_value > 4) {
        header('Location: ../account.html?error=invalid_sport_value');
        exit();
    }

    // 先检查邮箱是否已存在
    $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM user WHERE EMAIL = ?");
    $checkEmail->execute([$_POST['email']]);
    
    if ($checkEmail->fetchColumn() > 0) {
        header('Location: ../account.html?error=email_exists');
        exit();
    }

    // 邮箱不存在，继续注册流程
    $stmt = $pdo->prepare("INSERT INTO user (SURNAME, NAME, EMAIL, PWD, ID_SEXE, SPORT_VALUE, DATE_OF_BRITH, HEIGHT) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $_POST['surname'],
        $_POST['name'],
        $_POST['email'],
        $_POST['password'],
        $_POST['id_sexe'],
        $sport_value,
        $_POST['date_of_birth'],
        $_POST['height']
    ]);

    // 注册成功，直接重定向
    header('Location: ../account.html?registered=success');
    exit();

} catch(PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());
    header('Location: ../account.html?error=system');
    exit();
}
?>