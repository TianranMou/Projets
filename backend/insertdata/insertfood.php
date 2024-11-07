<?php

$host = 'localhost'; 
$dbname = 'tptest'; 
$user = 'root';
$password = 'root'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("fail: " . $e->getMessage());
    alert('fail');
}


$csvFile = 'food.csv';


if (($handle = fopen($csvFile, "r")) !== FALSE) {
    fgetcsv($handle); 

    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $IDsubsubgroup = $data[0];
        $IDfood = $data[1];
        $foodName = $data[2];

    
        $sql = "INSERT INTO food (ID_SUBSUBGROUP, ID_FOOD, FOOD_NAME) VALUES (:IDsubsubgroup, :IDfood, :foodName)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':IDsubsubgroup', $IDsubsubgroup);
        $stmt->bindParam(':IDfood', $IDfood);
        $stmt->bindParam(':foodName', $foodName);

        
        $stmt->execute();
    }

    
    fclose($handle);
    echo "success";
} else {
    echo "fail";
}

?>
