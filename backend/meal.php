<?php
require_once 'pdo.php';  //

function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header('Content-type: application/json; charset=utf-8');
}

// 
function create_meal($pdo, $user_id, $meal_time, $items) {
    try {
        $pdo->beginTransaction();
        
        // 
        $sql = "INSERT INTO meal (ID_USER, DATE_MEAL) VALUES (:user_id, :meal_time)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':meal_time', $meal_time);
        $stmt->execute();
        
        $meal_id = $pdo->lastInsertId();
        
        // 
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

// 
function update_meal($pdo, $meal_id, $meal_time, $food_id, $quantity_eat) {
    try {
        $pdo->beginTransaction();
        
        // 
        $sql = "UPDATE meal 
                SET DATE_MEAL = :meal_time 
                WHERE ID_MEAL = :meal_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->bindParam(':meal_time', $meal_time);
        $stmt->execute();
        
        // 
        $sql = "UPDATE composition 
                SET ID_FOOD = :food_id, 
                    QUANTITY_EAT = :quantity_eat 
                WHERE ID_MEAL = :meal_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->bindParam(':food_id', $food_id);
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

// 
function delete_meal($pdo, $meal_id) {
    try {
        $pdo->beginTransaction();
        
        // 
        $sql = "DELETE FROM composition WHERE ID_MEAL = :meal_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
        $stmt->execute();
        
        // 
        $sql = "DELETE FROM meal WHERE ID_MEAL = :meal_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':meal_id', $meal_id);
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

// 
try {
    setHeaders();
    
    switch($_SERVER["REQUEST_METHOD"]) {
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['user_id']) && isset($data['meal_time']) && 
                isset($data['items'])) {
                    
                $id = create_meal($pdo, 
                    $data['user_id'],
                    $data['meal_time'],
                    $data['items']);
                http_response_code(201);
                exit(json_encode([
                    'status' => 'success',
                    'message' => 'Meal created successfully',
                    'meal_id' => $id
                ]));
            } else {
                http_response_code(400);
                exit(json_encode(['error' => 'Invalid input']));
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['meal_id']) && 
                isset($data['meal_time']) && isset($data['food_id']) && 
                isset($data['quantity_eat'])) {
                    
                $success = update_meal($pdo,
                    $data['meal_id'],
                    $data['meal_time'],
                    $data['food_id'],
                    $data['quantity_eat']
                );
                
                if ($success) {
                    http_response_code(200);
                    exit(json_encode([
                        'status' => 'success',
                        'message' => 'Meal updated successfully'
                    ]));
                } else {
                    http_response_code(404);
                    exit(json_encode(['error' => 'Meal not found']));
                }
            } else {
                http_response_code(400);
                exit(json_encode(['error' => 'Invalid input']));
            }
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['meal_id'])) {
                $success = delete_meal($pdo, $data['meal_id']);
                
                if ($success) {
                    http_response_code(200);
                    exit(json_encode([
                        'status' => 'success',
                        'message' => 'Meal deleted successfully'
                    ]));
                } else {
                    http_response_code(404);
                    exit(json_encode(['error' => 'Meal not found']));
                }
            } else {
                http_response_code(400);
                exit(json_encode(['error' => 'Invalid input']));
            }
            break;
            
        default:
            http_response_code(405);
            exit(json_encode(['error' => 'Method not allowed']));
    }
    
} catch (Exception $e) {
    http_response_code(500);
    exit(json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]));
}




?>