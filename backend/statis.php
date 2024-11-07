<?php
session_start();
require_once("pdo.php");


function get_daily_nutrition($pdo, $userid) {
    if (isset($userid)) {
        $sql = "    SELECT nutrition.DICTIONARYNUTRITION, IFNULL(AVG(daily_nutrient_totals.total_nutrient), 0) AS average_daily_intake
                    FROM 
                        nutrition
                    LEFT JOIN (
                        SELECT 
                            m.ID_USER,
                            DATE(m.DATE_MEAL) AS day_meal,
                            n.ID_NUTRITION,
                            SUM(n.QUANTITY_CHARACTERISTIC * c.QUANTITY_EAT / 100) AS total_nutrient
                        FROM 
                            meal m
                        JOIN 
                            composition c ON c.ID_MEAL = m.ID_MEAL
                        JOIN 
                            food f ON c.ID_FOOD = f.ID_FOOD
                        JOIN 
                            nutrition_per_100g n ON f.ID_FOOD = n.ID_FOOD
                        WHERE 
                            m.ID_USER = :id_user
                        GROUP BY 
                            day_meal, m.ID_USER, n.ID_NUTRITION
                    ) AS daily_nutrient_totals 
                    ON daily_nutrient_totals.ID_NUTRITION = nutrition.ID_NUTRITION
                    GROUP BY 
                        nutrition.ID_NUTRITION
                ";
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


function get_userdata($pdo,$userid){
    if (isset($userid)){
        $sql="SELECT DATE_OF_BIRTH, SPORT_VALUE, HEIGHT
        FROM user
        WHERE ID_USER = :id_user";
        $stmt = $pdo ->prepare($sql);
        $stmt->bindParam(':id_user', $userid, PDO::PARAM_INT);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $res;
    } 
}

function get_userinfo($pdo,$userid){
    if (isset($userid)){
        $sql="SELECT *
        FROM user
        WHERE ID_USER = :id_user";
        $stmt = $pdo ->prepare($sql);
        $stmt->bindParam(':id_user', $userid, PDO::PARAM_INT);
        $stmt->execute();
        $res = $stmt->fetchAll(PDO::FETCH_OBJ);
        return $res;
    } 
}



function get_top5food($pdo, $userid) {
    if (isset($userid)) {
        $sql = "SELECT f.FOOD_NAME, 
                    COALESCE(SUM(c.QUANTITY_EAT), 0) AS total_consumed 
                FROM 
                    food f
                LEFT JOIN 
                    composition c ON f.ID_FOOD = c.ID_FOOD
                LEFT JOIN 
                    meal m ON c.ID_MEAL = m.ID_MEAL 
                WHERE 
                    m.ID_USER = :id_user 
                GROUP BY 
                    f.FOOD_NAME  
                ORDER BY 
                    total_consumed DESC
                LIMIT 5";
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


function updateUserField($pdo,$user_id, $field_name, $updated_value) {

    // $allowed_fields = ["surname", "name", "email", "id_sexe", "sport_value", "height", "date_of_birth"];

    
    // if (!in_array($field_name, $allowed_fields)) {
    //     return ["status" => "error", "message" => "Field not allowed"];
    // }
        $sql = "UPDATE user SET $field_name = :updated_value WHERE ID_USER = :user_id";
        $stmt = $pdo->prepare($sql);
        
        $stmt->bindParam(':updated_value', $updated_value);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return ["status" => "success", "message" => "Update successful"];
        } else {
            return ["status" => "error", "message" => "Failed to update"];
        }
}


if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'login first']);
    exit();
}


function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json; charset=utf-8');
}

setHeaders();


switch ($_SERVER["REQUEST_METHOD"]) {

    case 'GET':
        $action = isset($_GET['action']) ? $_GET['action'] : null;
        $userid = $_SESSION['user_id'];

    switch ($action) {
        case 'nutrition':
            $nutrition_data = get_daily_nutrition($pdo, $userid);
            if ($nutrition_data !== null) {
                http_response_code(200);
                echo json_encode($nutrition_data);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'No nutrition data found']);
            }
            break;

        case 'user':
            $user_data = get_userdata($pdo, $userid);
            $nutrition_data = get_daily_nutrition($pdo,$userid);
            if ($user_data !== null && $nutrition_data !== null) {
                http_response_code(200);
                $response = [
                    'user_data' => $user_data,
                    'nutrition_data' => $nutrition_data
                ];
                echo json_encode($response);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
            break;

        case 'top5food':
            $top_foods = get_top5food($pdo, $userid);
            if ($top_foods !== null) {
                http_response_code(200);
                echo json_encode($top_foods);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'No food data found']);
            }
            break;

        case 'userinfo':
            $user_data = get_userinfo($pdo, $userid);
            if ($userid!== null) {
                http_response_code(200);
                echo json_encode($user_data);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'No data found']);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
    break;

    case 'PUT':
        $userid = $_SESSION['user_id'];
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['field_name'], $data['updated_value'])) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid input"]);
            exit;
        }
        $field_name = $data['field_name'];
        $updated_value = $data['updated_value'];

        $response = updateUserField($pdo,$userid, $field_name, $updated_value);
        if ($response["status"] === "success") {
            echo json_encode($response);
        } else {
            http_response_code(400);
            echo json_encode($response);
}
}

?>
