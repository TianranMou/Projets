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


$csvFile = 'nutrition.csv';


if (($handle = fopen($csvFile, "r")) !== FALSE) {
    fgetcsv($handle); 

    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $IDnutrition = $data[0];
        $nutritionName = $data[1];

    
        $sql = "INSERT INTO nutrition (ID_NUTRITION, DICTIONARYNUTRITION) VALUES (:IDnutrition, :nutritionName)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':IDnutrition', $IDnutrition);
        $stmt->bindParam(':nutritionName', $nutritionName);

        $stmt->execute();
    }

    
    fclose($handle);
    echo "success";
} else {
    echo "fail";
}

?>
