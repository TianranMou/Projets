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
        
        error_log('Login successful - User ID: ' . $_SESSION['user_id'] . ', Name: ' . $_SESSION['user_name']);
        
        header('Location: ../account.html');
        exit();
    } else {
        header('Location: ../account.html?error=invalid');
        exit();
    }

} catch(PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    header('Location: ../account.html?error=system');
    exit();
}
?>