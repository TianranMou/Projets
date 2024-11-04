<?php
require_once("pdo.php");


function get_meals($pdo, $userid) {
    if (isset($userid)) {

        $sql = "SELECT m.DATE_MEAL, c.QUANTITY_EAT, f.ID_FOOD,f.FOOD_NAME, m.ID_MEAL
                FROM meal m 
                JOIN composition c ON c.ID_MEAL = m.ID_MEAL 
                JOIN food f ON f.ID_FOOD = c.ID_FOOD
                WHERE m.ID_USER = :id_user
                ORDER BY m.DATE_MEAL DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id_user', $userid, PDO::PARAM_INT);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $res;
    } else {
        error_log("No user_id in request");
        return null;
    }
}

// function get_meals($pdo, $userid) {
//     if (isset($userid)) {
//         $sql = "SELECT f.FOOD_NAME
//                 FROM food f
//                 WHERE f.ID_FOOD = 25933";
//         $stmt = $pdo->prepare($sql);
//         $stmt->execute();
//         $res = $stmt->fetchAll(PDO::FETCH_OBJ);
//         return $res;
//     } else {
//         error_log("No user_id in request");
//         return null;
//     }
// }

function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json; charset=utf-8');
}

setHeaders();

switch ($_SERVER["REQUEST_METHOD"]) {
    case 'POST':
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (isset($data['user_id'])) {
            
            error_log("Received user_id: " . $data['user_id']);
            
            $check_user_sql = "SELECT COUNT(*) FROM meal WHERE ID_USER = :id";
            $stmt = $pdo->prepare($check_user_sql);
            $stmt->bindParam(':id', $data['user_id'], PDO::PARAM_INT);
            $stmt->execute();
            $user_exists = $stmt->fetchColumn() > 0;
            
            if (!$user_exists) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            
            $meals = get_meals($pdo, $data['user_id']);
            
            if ($meals !== null) {
                http_response_code(200);
                echo json_encode($meals);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'No meals found for this user']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input: user_id is required']);
        }
        exit();
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        exit();
}
?>
