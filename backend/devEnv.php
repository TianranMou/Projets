<?php
define('ENV', 'development');

session_start();

if (ENV === 'development') {
    $_SESSION['user_id'] = 11; 
}

?>