<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Récupération des données
$jsonInput = file_get_contents("php://input");
$newEvent = json_decode($jsonInput, true);

if (!$newEvent) {
    http_response_code(400);
    echo json_encode(["message" => "Données invalides"]);
    exit;
}

// --- CHANGEMENT DE CHEMIN ICI ---
// On remonte d'un dossier (..) puis on va dans BDD
$file = '../BDD/data.json'; 

if (file_exists($file)) {
    $currentData = file_get_contents($file);
    $arrayData = json_decode($currentData, true);
} else {
    $arrayData = [];
}

// Gestion ID
$lastId = count($arrayData) > 0 ? end($arrayData)['id'] : 0;
$newEvent['id'] = $lastId + 1;

// Ajout
$arrayData[] = $newEvent;

// Sauvegarde
if (file_put_contents($file, json_encode($arrayData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(["message" => "Sauvegardé", "id" => $newEvent['id']]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Erreur écriture dans BDD/data.json"]);
}
?>