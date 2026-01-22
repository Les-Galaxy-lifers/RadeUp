<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Récupération input
$jsonInput = file_get_contents("php://input");
$newEvent = json_decode($jsonInput, true);

if (!$newEvent) {
    http_response_code(400);
    echo json_encode(["message" => "Données invalides"]);
    exit;
}

// Lecture fichier
$file = '../BDD/data.json';

if (file_exists($file)) {
    $currentData = file_get_contents($file);
    $jsonObj = json_decode($currentData, true);
} else {
    // Si vide, on crée la structure de base
    $jsonObj = ["actions" => []];
}

// Vérif structure
if (!isset($jsonObj['actions'])) {
    $jsonObj['actions'] = [];
}

// ID Auto-incrément
$lastId = 0;
if (count($jsonObj['actions']) > 0) {
    $lastItem = end($jsonObj['actions']);
    $lastId = $lastItem['id'];
}
$newEvent['id'] = $lastId + 1;

// Ajout DANS la liste 'actions'
$jsonObj['actions'][] = $newEvent;

// Sauvegarde
if (file_put_contents($file, json_encode($jsonObj, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode(["message" => "Sauvegardé", "id" => $newEvent['id']]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Erreur écriture"]);
}
?>