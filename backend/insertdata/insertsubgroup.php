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


$csvFile = 'subgroup.csv';


if (($handle = fopen($csvFile, "r")) !== FALSE) {
    fgetcsv($handle); 

    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $IDgroup = $data[0];
        $IDsubgroup = $data[1];
        $groupName = $data[2];

    
        $sql = "INSERT INTO subgroup (ID_group, ID_subgroup, Name_Subgroup) VALUES (:IDgroup, :IDsubgroup, :group_name)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':IDgroup', $IDgroup);
        $stmt->bindParam(':IDsubgroup', $IDsubgroup);
        $stmt->bindParam(':group_name', $groupName);

        
        $stmt->execute();
    }

    
    fclose($handle);
    echo "success！";
} else {
    echo "fail。";
}

?>
