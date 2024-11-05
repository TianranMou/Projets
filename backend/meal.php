<?php
session_start();
require_once 'pdo.php';

function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header('Content-type: application/json; charset=utf-8');
}

// 验证用户是否登录
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        exit(json_encode(['error' => '请先登录']));
    }
    return $_SESSION['user_id'];
}

// 验证meal是否属于当前用户
function verifyMealOwnership($pdo, $meal_id, $user_id) {
    $sql = "SELECT COUNT(*) FROM meal WHERE ID_MEAL = :meal_id AND ID_USER = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':meal_id' => $meal_id,
        ':user_id' => $user_id
    ]);
    return $stmt->fetchColumn() > 0;
}

function create_meal($pdo, $user_id, $meal_time, $items) {
    try {
        $pdo->beginTransaction();
        
        // 创建meal记录
        $sql = "INSERT INTO meal (ID_USER, DATE_MEAL) VALUES (:user_id, :meal_time)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':meal_time', $meal_time);
        $stmt->execute();
        
        $meal_id = $pdo->lastInsertId();
        
        // 创建composition记录
        $sql = "INSERT INTO composition (ID_MEAL, ID_FOOD, QUANTITY_EAT) 
                VALUES (:meal_id, :food_id, :quantity_eat)";
        $stmt = $pdo->prepare($sql);

        foreach($items as $item){
            $stmt->bindParam(':meal_id', $meal_id);
            $stmt->bindParam(':food_id', $item['food_id']);
            $stmt->bindParam(':quantity_eat', $item['quantity_eat']);
            $stmt->execute();
        }
        
        $pdo->commit();
        return $meal_id;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

function update_meal($pdo, $meal_id, $meal_time, $food_id, $food_id_old, $quantity_eat) {
    try {
        $pdo->beginTransaction();
        
        // 更新meal表
        $sql = "UPDATE meal 
                SET DATE_MEAL = :meal_time 
                WHERE ID_MEAL = :meal_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->bindParam(':meal_time', $meal_time);
        $stmt->execute();
        
        // 更新composition表
        $sql = "UPDATE composition 
                SET ID_FOOD = :food_id_new, 
                    QUANTITY_EAT = :quantity_eat 
                WHERE ID_MEAL = :meal_id AND ID_FOOD = :food_id_old";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->bindParam(':food_id_new', $food_id);
        $stmt->bindParam(':food_id_old', $food_id_old);
        $stmt->bindParam(':quantity_eat', $quantity_eat);
        $stmt->execute();
        
        $pdo->commit();
        return true;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

function delete_meal($pdo, $meal_id, $food_id) {
    try {
        $pdo->beginTransaction();
        
        // 删除composition记录
        $sql = "DELETE FROM composition WHERE ID_MEAL = :meal_id AND ID_FOOD = :food_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->bindParam(':food_id', $food_id);
        $stmt->execute();
        
        // 检查是否还有其他composition记录
        $sql = "SELECT COUNT(*) FROM composition WHERE ID_MEAL = :meal_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->execute();
        
        // 如果没有其他composition记录，删除meal记录
        if ($stmt->fetchColumn() == 0) {
            $sql = "DELETE FROM meal WHERE ID_MEAL = :meal_id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':meal_id', $meal_id);
            $stmt->execute();
        }
        
        $pdo->commit();
        return true;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

try {
    setHeaders();
    $current_user_id = checkAuth(); // 获取当前登录用户ID
    
    switch($_SERVER["REQUEST_METHOD"]) {
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['meal_time']) && isset($data['items']) && !empty($data['items'])) {
                $id = create_meal($pdo, 
                    $current_user_id,
                    $data['meal_time'],
                    $data['items']);
                http_response_code(201);
                exit(json_encode([
                    'status' => 'success',
                    'message' => '添加成功',
                    'meal_id' => $id
                ]));
            } else {
                http_response_code(400);
                exit(json_encode(['error' => '请填写所有必要信息']));
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['meal_id']) && isset($data['meal_time']) && 
                isset($data['food_id']) && isset($data['quantity_eat']) && 
                isset($data['food_id_old'])) {
                
                // 
                if (!verifyMealOwnership($pdo, $data['meal_id'], $current_user_id)) {
                    http_response_code(403);
                    exit(json_encode(['error' => '无权操作此记录']));
                }
                
                $success = update_meal($pdo,
                    $data['meal_id'],
                    $data['meal_time'],
                    $data['food_id'],
                    $data['food_id_old'],
                    $data['quantity_eat']
                );
                
                if ($success) {
                    http_response_code(200);
                    exit(json_encode([
                        'status' => 'success',
                        'message' => '更新成功'
                    ]));
                }
            }
            http_response_code(400);
            exit(json_encode(['error' => '请填写所有必要信息']));
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['meal_id']) && isset($data['food_id'])) {
                // 验证meal是否属于当前用户
                if (!verifyMealOwnership($pdo, $data['meal_id'], $current_user_id)) {
                    http_response_code(403);
                    exit(json_encode(['error' => '无权操作此记录']));
                }
                
                $success = delete_meal($pdo, $data['meal_id'], $data['food_id']);
                if ($success) {
                    http_response_code(200);
                    exit(json_encode([
                        'status' => 'success',
                        'message' => '删除成功'
                    ]));
                }
            }
            http_response_code(400);
            exit(json_encode(['error' => '请提供餐食ID']));
            break;
            
        case 'OPTIONS':
            http_response_code(200);
            exit();
            
        default:
            http_response_code(405);
            exit(json_encode(['error' => '不支持的请求方法']));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode([
        'status' => 'error',
        'message' => '服务器错误: ' . $e->getMessage()
    ]));
}
?>