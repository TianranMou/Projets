<?php
session_start();
require_once("pdo.php");

function get_meals($pdo, $userid, $search = null) {
    if (isset($userid)) {
        $sql = "SELECT 
                m.DATE_MEAL, 
                c.QUANTITY_EAT, 
                f.ID_FOOD,
                f.FOOD_NAME, 
                m.ID_MEAL
                FROM meal m 
                JOIN composition c ON c.ID_MEAL = m.ID_MEAL 
                JOIN food f ON f.ID_FOOD = c.ID_FOOD
                WHERE m.ID_USER = :id_user";

        // 如果有搜索条件
        if ($search) {
            $sql .= " AND (f.FOOD_NAME LIKE :search OR m.DATE_MEAL LIKE :search)";
        }

        $sql .= " ORDER BY m.DATE_MEAL DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id_user', $userid, PDO::PARAM_INT);
        
        if ($search) {
            $searchParam = "%$search%";
            $stmt->bindParam(':search', $searchParam, PDO::PARAM_STR);
        }

        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $res;
    } else {
        error_log("No user_id in request");
        return null;
    }
}

function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json; charset=utf-8');
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}

setHeaders();

// 检查用户是否已登录
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => '请先登录']);
    exit();
}

switch ($_SERVER["REQUEST_METHOD"]) {
    case 'POST':
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        // 使用session中的用户ID而不是请求中的ID
        $userId = $_SESSION['user_id'];
        
        // 获取可选的搜索参数
        $search = isset($data['search']) ? $data['search'] : null;
        
        // 验证用户是否存在
        $check_user_sql = "SELECT COUNT(*) FROM meal WHERE ID_USER = :id";
        $stmt = $pdo->prepare($check_user_sql);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user_exists = $stmt->fetchColumn() > 0;
        
        if (!$user_exists) {
            http_response_code(404);
            echo json_encode(['error' => '未找到用户数据']);
            exit();
        }
        
        $meals = get_meals($pdo, $userId, $search);
        
        if ($meals !== null && !empty($meals)) {
            http_response_code(200);
            echo json_encode($meals);
        } else {
            http_response_code(404);
            echo json_encode(['error' => '未找到餐食记录']);
        }
        break;
        
    case 'OPTIONS':
        http_response_code(200);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => '不支持的请求方法']);
        break;
}
?>
