<?php
// 数据库配置信息
$host = 'localhost'; // 数据库主机
$dbname = 'tptest'; // 数据库名
$user = 'root'; // 用户名
$password = 'root'; // 密码

// 连接数据库
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("数据库连接失败: " . $e->getMessage());
    alert('fail');
}

// CSV 文件路径
$csvFile = 'subsubgroup.csv';

// 打开 CSV 文件
if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // 跳过表头行（如果有表头）
    fgetcsv($handle); // 如果 CSV 文件的第一行是表头，取消注释此行

    // 逐行读取 CSV 文件
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // 获取第一列（IDgroup）和第四列（group_name）
        $IDsubgroup = $data[0];
        $IDsubsubgroup = $data[1];
        $groupName = $data[2];

        // 插入数据到数据库
        $sql = "INSERT INTO subsubgroup (ID_subgroup, ID_subsubgroup, Name_Subsubgroup) VALUES (:IDsubgroup, :IDsubsubgroup, :group_name)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':IDsubgroup', $IDsubgroup);
        $stmt->bindParam(':IDsubsubgroup', $IDsubsubgroup);
        $stmt->bindParam(':group_name', $groupName);

        // 执行插入
        $stmt->execute();
    }

    // 关闭 CSV 文件
    fclose($handle);
    echo "数据插入完成！";
} else {
    echo "无法打开文件。";
}

?>
