<?php
require_once("pdo.php");


function get_daily_nutrition($pdo, $userid) {
    if (isset($userid)) {
        $sql = "SELECT nutrition.DICTIONARYNUTRITION,
                AVG(total_nutrient) AS average_daily_intake
                FROM (
                    SELECT 
                        m.ID_USER,
                            m.DATE_MEAL,
                            n.ID_NUTRITION,
                        SUM(n.QUANTITY_CHARACTERISTIC * c.QUANTITY_EAT/100) AS total_nutrient
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
                        m.DATE_MEAL, m.ID_USER, n.ID_NUTRITION
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




function setHeaders() {
    header("Access-Control-Allow-Origin: *");
    header('Content-type: application/json; charset=utf-8');
}

setHeaders();


switch ($_SERVER["REQUEST_METHOD"]) {

    case 'GET':
        if (isset($_GET['user_id'])) {
            $userid = $_GET['user_id'];
            error_log("Received user_id: " . $userid);

            $daily_nutrition = get_daily_nutrition($pdo, $userid);
            if ($daily_nutrition !== null) {
                http_response_code(200);
                echo json_encode($daily_nutrition);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'can not find your data']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'unvalid input: user_id is nessecary']);
        }
        exit();
        break;
    
  
    case 'GET':
        if (isset($_GET['user_id'])) {
            $userid = $_GET['user_id'];
            error_log("Received user_id: " . $userid);

            $top_foods = get_top_foods($pdo, $userid);
            if ($top_foods !== null) {
                http_response_code(200);
                echo json_encode($top_foods);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'can not find your top 5 consomated food']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'invalid input: user_id is necessary']);
        }
        exit();
        break;

    // 
    default:
        http_response_code(405);
        echo json_encode(['error' => 'unallowed method']);
        exit();
}


?>
