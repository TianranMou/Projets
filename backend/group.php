<?php
require_once("pdo.php");

function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json; charset=utf-8');
}

function getGroup($pdo){
    $sql = "SELECT ID_GROUP, NAME_GROUP FROM foodgroup";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_OBJ);
}

// 
function getSubGroup($pdo, $groupId) {
    $sql = "SELECT ID_SUBGROUP, Name_Subgroup FROM subgroup WHERE ID_GROUP = :group_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':group_id', $groupId, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_OBJ);
}

//
function getSubSubGroup($pdo, $subGroupId) {
    $sql = "SELECT ID_SUBSUBGROUP, Name_Subsubgroup FROM subsubgroup WHERE ID_SUBGROUP = :subgroup_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':subgroup_id', $subGroupId, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_OBJ);
}

function getfood($pdo, $subSubGroupId) {
    $sql = "SELECT ID_FOOD, FOOD_NAME FROM food WHERE ID_SUBSUBGROUP = :subsubgroupid";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':subsubgroupid', $subSubGroupId, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_OBJ);
}
// 
setHeaders();

// 
switch ($_SERVER["REQUEST_METHOD"]) {
    case 'GET':
        if (isset($_GET['groupId'])) {
            // 
            $groupId = $_GET['groupId'];
            $subgroup = getSubGroup($pdo, $groupId);
            echo json_encode($subgroup);
        } elseif (isset($_GET['subGroupId'])) {
            // 
            $subGroupId = $_GET['subGroupId'];
            $subSubGroup = getSubSubGroup($pdo, $subGroupId);
            echo json_encode($subSubGroup);
        } elseif (isset($_GET['subSubGroupId'])) {
            
            $subSubGroupId = $_GET['subSubGroupId'];
            $items = getfood($pdo, $subSubGroupId);
            echo json_encode($items);
        } else {
            $group = getGroup($pdo);
            echo json_encode($group);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
?>