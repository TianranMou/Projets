<?php

set_time_limit(300);

$host = 'localhost';
$dbname = 'tptest';
$user = 'root';
$password = 'root';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("fail: " . $e->getMessage());
}

$csvFile = 'nutritionper100.csv';

// $lineLimit = 500;
// $lineNumber = 0;

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    fgetcsv($handle); 

    // $lineNumber=1;


    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $foodID = $data[0]; 
        
   
        for ($i = 1; $i < count($data); $i++) {
            $nutritionID = $i; 
            $quantity = $data[$i]; 
           

            if ($quantity === '' || $quantity === null) {
                continue;
            }

            $sql = "INSERT INTO nutrition_per_100g (ID_FOOD, ID_NUTRITION, QUANTITY_CHARACTERISTIC) VALUES (:foodID, :nutritionID, :quantity)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':foodID', $foodID);
            $stmt->bindParam(':nutritionID', $nutritionID);
            $stmt->bindParam(':quantity', $quantity);

            $stmt->execute();

            
        }

    // $lineNumber++;

    // echo "  $lineNumber  ";
    
    }

    fclose($handle);
    echo "sucess";
} else {
    echo "fail";
}

?>
