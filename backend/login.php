<?php
session_start();

try {
    $pdo = new PDO('mysql:host=localhost;dbname=tptest', 'root', 'root');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM user WHERE EMAIL = ? AND PWD = ?");
    $stmt->execute([$email, $password]);
    
    if ($user = $stmt->fetch()) {
        $_SESSION['user_id'] = $user['ID_USER'];
        $_SESSION['user_name'] = $user['NAME'];
        header('Location: ../add.html');  
        exit();
    } else {
        header('Location: ../account.html?error=invalid');
        exit();
    }

} catch(PDOException $e) {
    header('Location: ../account.html?error=system');
    exit();
}
?>