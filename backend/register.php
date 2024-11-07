<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tptest', 'root', 'root');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

   
    $sport_value = intval($_POST['sport_value']);
    if ($sport_value < 0 || $sport_value > 4) {
        header('Location: ../frontend/account.html?error=invalid_sport_value');
        exit();
    }


    $checkEmail = $pdo->prepare("SELECT COUNT(*) FROM user WHERE EMAIL = ?");
    $checkEmail->execute([$_POST['email']]);
    
    if ($checkEmail->fetchColumn() > 0) {
        header('Location: ../frontend/account.html?error=email_exists');
        exit();
    }


    $stmt = $pdo->prepare("INSERT INTO user (SURNAME, NAME, EMAIL, PWD, ID_SEXE, SPORT_VALUE, DATE_OF_BIRTH, HEIGHT) 
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

 
    header('Location: ../frontend/account.html?registered=success');
    exit();

} catch(PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());
    header('Location: ../frontend/account.html?error=system');
    exit();
}
?>