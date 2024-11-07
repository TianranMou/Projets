<?php
session_start();
session_destroy();
header('Location: ../frontend/account.html');
exit();