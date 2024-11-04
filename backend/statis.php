<?php
require_once("pdo.php");


function get_daily_nutrition($pdo, $userid) {
    if (isset($userid)) {
        $sql = "SELECT nutrition.DICTIONARYNUTRITION,
                AVG(total_nutrient) AS average_daily_intake
                FROM (
                    SELECT 
                        m.ID_USER,
                            m.DATE,
                            n.ID_NUTRITION,
                        SUM(n.QUANTITY_CHARACTERISTIC * c.QUATITY_EAT/100) AS total_nutrient
                    FROM 
                        meal m
                    JOIN
                        composition c ON c.ID_MEAL = m.ID_MEAL
                    JOIN 
                        food f ON c.ID_FOOD = f.ID_FOOD
                    JOIN 
                        nutrition_per_100g n ON f.ID_FOOD = n.ID_FOOD
                    WHERE 
                        m.ID_USER = 1
                    GROUP BY 
                        m.DATE, m.ID_USER, n.ID_NUTRITION
                ) AS daily_nutrient_totals

                JOIN nutrition ON daily_nutrient_totals.ID_NUTRITION = nutrition.ID_NUTRITION
                GROUP BY 
                daily_nutrient_totals.ID_NUTRITION
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
                    m.ID_USER = 1  
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


function get_top5food_of_allusers($pdo, $userid) {
    if (isset($userid)) {
        $sql = "SELECT 
                    FOOD_NAME,
                    total_consumed,
                    ID_USER
                FROM (
                    SELECT 
                        f.FOOD_NAME,
                        COALESCE(SUM(c.QUANTITY_EAT), 0) AS total_consumed,
                        m.ID_USER,
                        IF(
                            @prev_user = m.ID_USER,
                            @row_num := @row_num + 1,
                            @row_num := IF(@prev_user := m.ID_USER, 1, 1)
                        ) AS row_num
                    FROM 
                        food f
                    LEFT JOIN 
                        composition c ON f.ID_FOOD = c.ID_FOOD
                    LEFT JOIN 
                        meal m ON c.ID_MEAL = m.ID_MEAL,
                        (SELECT @row_num := 0, @prev_user := 0) AS vars
                    WHERE 
                        m.ID_USER IS NOT NULL
                    GROUP BY 
                        f.FOOD_NAME, m.ID_USER
                    ORDER BY 
                        m.ID_USER, total_consumed DESC
                ) all_foods
                WHERE 
                    row_num <= 5
                ORDER BY 
                    ID_USER, 
                    total_consumed DESC";
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
